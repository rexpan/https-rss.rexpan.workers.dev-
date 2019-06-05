import cheerio  from "cheerio";
import {getAsBrowser} from "../common/request";

import { fetchAtom } from "../common/fetchAtom";
import { Feed } from 'feed';
import FeedParser from 'feedparser';

export class Processor {
    tItem        = {};
    items        = [];
    feedUrl      = "https://udemycoupon.learnviral.com/coupon-category/free100-discount/feed/";

    constructor(options:{}) {
        Object.assign(this, options);
    }

    async start(): Promise<[Error|undefined, string]> {
        const [error, items, meta] = await getOrigFeed(this.feedUrl);
        if (error != null) return [error, ""];

        const newItems = items.filter(item  => this.tItem[item.id] == null);
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

async function getOrigFeed(feedUrl:string) {
    const [error, xs, meta] = await fetchAtom(feedUrl);
    return [
        error,
        error ? [] : (await Promise.all(xs.map(parseItem))).filter(Boolean),
        meta
    ] as const;
}

async function parseItem(item:FeedParser.Item) {
    const { link } = item;

    const [rErr,, rBody] = await getAsBrowser(link);
    if (rErr != null) return item;

    try {
        const $ = cheerio.load(rBody);
        const href = $(`a.coupon-code-link`).attr("href");
        const url = new URL(href);
        if (!url.search) return undefined!;
        return ({ ...item, link:href });
    } catch(e) {
        console.error(link, e);
        return item;
    }
}

function getFeed(items:FeedParser.Item[], meta:FeedParser["meta"]) {
    const feed = new Feed(meta);
    items.forEach(({ id, ...post }) => feed.addItem(post));
    return feed;
}

