import { Processor as P9Gag } from "./9gag/Processor";
import { Processor as PUdemy } from "./udemycoupon.learnviral.com/Processor";
import { Processor as PFeng } from "./bbs.feng.com/Processor";
import { atomResponse } from "./utils/static";

const p9Gag = new P9Gag({});
const pUdemy = new PUdemy({});
const pFeng = new PFeng({});

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
});

/**
 * Fetch and log a request
 * @param {Request} request
 */
async function handleRequest(request:Request) {
  let processor;
  if (request.url.includes("9gag")) processor = p9Gag;
  else if (request.url.includes("udemy")) processor = pUdemy;
  else if (request.url.includes("feng")) processor = pFeng;

  if (processor == null) return new Response('No support', { status: 400 });
  const [err, xml] = await processor.start();
  if (err) {
    console.error(err);
    return await fetch(processor.feedUrl)
  } else return atomResponse(xml);
}
