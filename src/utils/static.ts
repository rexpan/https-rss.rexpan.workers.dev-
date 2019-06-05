
/**
 * rawHtmlResponse delievers a response with HTML inputted directly
 * into the worker script
 * @param {string} html
 */
export async function rawHtmlResponse(html:string) {
  const init = {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
    },
  }

  return new Response(html, init)
}

/**
 * rawJsonResponse delievers a response with a Json Object inputted directly
 * into the worker script
 * @param {Object} json
 */
export async function rawJsonResponse(json:unknown) {
  const init = {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  }

  return new Response(JSON.stringify(json), init)
}

/**
 * rawJsonResponse delievers a response with a Json Object inputted directly
 * into the worker script
 * @param {Object} json
 */
export async function atomResponse(xml:string) {
  const init = {
    headers: {
      'content-type': 'application/atom+xml;charset=UTF-8',
    },
  }

  return new Response(xml, init)
}

/**
 * redirectResponse returns a redirect Response
 * @param {string} url where to redirect the response
 * @param {number?=301|302} type permanent or temporary redirect
 */
async function redirectResponse(url:string, type:301|302 = 301) {
    return Response.redirect(url, type)
}

/**
 * redirectOnDeviceType checks the device header set by Cloudflare
 * and returns a temporary redirect to the corresponding hostnames
 * @param {Request} request
 */
async function getDeviceType(request:Request) {
    return request.headers.get('CF-Device-Type');
}
