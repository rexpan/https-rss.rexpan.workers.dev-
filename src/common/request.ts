const headers = {
    'User-Agent':"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    // "Accept-Encoding": "gzip, deflate, br",
};

export async function getAsBrowser(url:string): Promise<[Error|undefined, Response, string]>  {
    try {
        const res = await fetch(url, { headers });
        const body = await res.text();
        return [undefined, res, body]
    } catch (e) {
        return [e, undefined!, ""]
    }
}
