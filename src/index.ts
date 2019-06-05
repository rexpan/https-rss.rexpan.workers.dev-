import { Router } from "./utils/router";
import { atomResponse } from "./utils/static";
import { Processor as P9Gag } from "./9gag/Processor";
import { Processor as PUdemy } from "./udemycoupon.learnviral.com/Processor";
import { Processor as PFeng } from "./bbs.feng.com/Processor";

const p9Gag  = new P9Gag({});
const pUdemy = new PUdemy({});
const pFeng = new PFeng({});

// @ts-ignore
addEventListener('fetch', (event:FetchEvent) => {
  event.respondWith(handleRequest(event.request))
});

const r = new Router()
// Replace with the approriate paths and handlers
r.get('.*/9gag', process(p9Gag));
r.get('.*/udemy', process(pUdemy));
r.get('.*/feng', process(pFeng));

async function handleRequest(request:Request) {
  return await r.route(request);
}

function process(processor: P9Gag|PUdemy|PFeng) {
  return (async (request:Request) => {
    const [err, xml] = await processor.start();
    if (err) {
      console.error(err);
      return await fetch(processor.feedUrl)
    } else return atomResponse(xml);
  });
}
