import { fetchAtom } from "../common/fetchAtom";
import { Feed } from 'feed';

export class Processor {
    tItem        = {};
    items        = [];
    feedUrl      = "https://bbs.feng.com/forum.php?mod=rss&fid=22&auth=d7f0JqsskTdwmUWNfEmY0jGhaQeV0Ym5yaQkJ0SdQtIJqwCE%2FtcyIgGINgTttoCpWQ";

    constructor(options) {
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


// 网络小说 有声小说 集 册
const whiteList0 = "网络小说".toLowerCase().split(" ");
const whiteList = "epub 小说 电子书 新修版 精制版".toLowerCase().split(" ");
const blackList = "画传 心理学 百科全书".toLowerCase().split(" ");

function parseItem(item) {
    const { title, description } = item;
    const text = `${title}\n${description}`.toLowerCase();
    const isWhiteList = whiteList.some(keyword => text.includes(keyword));
    const isBlackList = blackList.some(keyword => text.includes(keyword));
    return (isWhiteList && !isBlackList) ? item : null;
}

function getFeed(items, meta) {
    const feed = new Feed(meta);
    items.forEach(({ id, video, img, ...post }) => feed.addItem(post));
    return feed;
}
