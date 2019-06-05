import cheerio from "cheerio";

import { fetchAtom } from "../common/fetchAtom";
import FeedParser from 'feedparser';
import { Feed } from 'feed';

export class Processor {
    tItem             = {};
    items:I9GagItem[] = [];
    feedUrl           = "https://9gag-rss.com/api/rss/get?code=9GAGHot&format=1";

    constructor(options:{}) {
        Object.assign(this, options);
    }

    async start(): Promise<[Error|undefined, string]> {
        const [error, items, meta] = await get9GagFeedVideoOnly(this.feedUrl);
        if (error != null) return [error, ""];

        const newItems = items.filter(item => this.tItem[item.id] == null);
        items.forEach(item => {
            if (this.tItem[item.id] == null)
                this.tItem[item.id] = item;
            else
                Object.assign(this.tItem[item.id], item);
        });

        if (newItems.length < 1) {
            return [undefined, ""];
        }

        this.items = this.items.concat(newItems);

        const feed = getFeed(this.items, meta);
        const xml = feed.atom1();

        return [undefined, xml];
    }
}

interface I9GagItem extends FeedParser.Item {
    id:string, video?:string, img?:string
}

async function get9GagFeedVideoOnly(feedUrl:string): Promise<[Error|undefined, I9GagItem[], FeedParser["meta"]]> {
    const [error, xs, meta] = await fetchAtom(feedUrl);
    if (error != null) {
        return [error, [], undefined!];
    }

    const items = xs.map(parseItem).filter(r => r.video != null);
    return [undefined, items, meta];
}

function parseItem(item:FeedParser.Item): I9GagItem {
    const { description, guid } = item;
    const $ = cheerio.load(description);
    const img = $("img").attr("src");
    const video = $(`video source`).attr("src");
    const id = guid.replace("https://9gag.com/gag/", "");
    return (video != null
        ? { ...item, id, video }
        : { ...item, id, img }
    );
}

function getFeed(items:I9GagItem[], meta:FeedParser["meta"]) {
    // @ts-ignore
    const feed = new Feed(meta);
    items.forEach(({ id, video, img, ...post }) => feed.addItem(post));
    return feed;
}




