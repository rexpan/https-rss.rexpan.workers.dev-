
/**
 * readRequestBody reads in the incoming request body
 * Use await readRequestBody(..) in an async function to get the string
 * @param {Request} request the incoming request to read from
 */
export async function readRequestBody(request:Request) {
  const { headers } = request
  const contentType = headers.get('content-type')
  if (contentType != null) {
    if (contentType.includes('application/json')) {
      const body = await request.json()
      return JSON.stringify(body)
    } else if (contentType.includes('application/text')) {
      const body = await request.text()
      return body
    } else if (contentType.includes('text/html')) {
      const body = await request.text()
      return body
    } else if (contentType.includes('form')) {
      const formData = await request.formData()
      const body = {}
      for (let [key, value] of formData.entries()) {
        if (Array.isArray(body[key])) body[key].push(value)
        else if (body[key] !== undefined) body[key] = [body[key], value]
        else body[key] = value
      }
      return JSON.stringify(body)
    }
  }
  const myBlob = await request.blob()
  return URL.createObjectURL(myBlob)
}

/**
 * gatherResponse awaits and returns a response body as a string.
 * Use await gatherResponse(..) in an async function to get the response body
 * @param {Response} response to
 */
export async function gatherResponse(response: Response) {
  const { headers } = response
  const contentType = headers.get('content-type')
  if (contentType != null) {
    if (contentType.includes('application/json')) {
      const body = await response.json()
      return JSON.stringify(body)
    } else if (contentType.includes('application/text')) {
      const body = await response.text()
      return body
    } else if (contentType.includes('text/html')) {
      const body = await response.text()
      return body
    }
  }
  const body = await response.text()
  return body
}

/**
 * fetchPostJson sends a POST request with data in JSON and
 * and reads in the response body. Use await fetchPostJson(..)
 * in an async function to get the response body
 * @param {string} url the URL to send the request to
 * @param {BodyInit} body the JSON data to send in the request
 */
export async function fetchPostJson(url:string, body:unknown = {}) {
  const init = {
    body: JSON.stringify(body),
    method: 'POST',
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  }

  const response = await fetch(url, init)
  return await gatherResponse(response)
}

/**
 * fetchGetHtml sends a GET request expecting html
 * Use await fetchGetHtml(..) in an async function to get the HTML
 * @param {string} url the URL to send the request to
 */
export async function fetchGetHtml(url:string) {
  const init = {
    method: 'Get',
    headers: {
      'content-type': 'text/html;charset=UTF-8',
    },
  }

  const response = await fetch(url, init)
  return await gatherResponse(response)
}

