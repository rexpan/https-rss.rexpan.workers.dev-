import FeedParser from 'feedparser';

const headers = {
    'User-Agent':"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    // "Accept-Encoding": "gzip, deflate, br",
};

export function fetchAtom(url:string) {
    return new Promise<[Error|undefined, any[], any]>(async (resolve) => {
        const feedparser = new FeedParser({});
        feedparser.on('error', (error:any) => resolve([error, [], null]));
        const items:FeedParser.Item[] = [];
        let meta: FeedParser["meta"];
        feedparser.on('readable', function(this:FeedParser) {
            const stream = this;
            meta = this.meta;
            let item;
            while (item = stream.read()) {
                items.push(item);
            }
        });
        feedparser.on('end', function () {
            resolve([undefined, items, meta]);
        });

        try {
            const res = await fetch(url, { headers });
            if (res.status !== 200) {
                resolve([new Error('Bad status code '+ res.status), [], null]);
                return;
            }
            res.body!.pipeTo(feedparser);
        } catch(e) {
            resolve([e, [], null]);
            return;
        }
    });
}
