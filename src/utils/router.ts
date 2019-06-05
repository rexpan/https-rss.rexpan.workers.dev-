/**
 * Conditions are helper functions that when passed a request
 * will return a boolean for if that request uses
 * that method, header, etc..
 *  */
interface ConditionFn {
  (req:Request): boolean;
}
type Conditions = ConditionFn | ConditionFn[];
const Method  = (method: string):ConditionFn => (req: Request) => req.method.toLowerCase() === method.toLowerCase()
const Get     = Method('get')
const Post    = Method('post')
const Put     = Method('put')
const Patch   = Method('patch')
const Delete  = Method('delete')
const Head    = Method('head')
const Options = Method('options')

const Header   = (header:string, val:string) => (req: Request) => req.headers.get(header) === val
const Host     = (host:string) => Header('host', host.toLowerCase())
const Referrer = (host:string) => Header('referrer', host.toLowerCase())

const Path = (regExp:string|RegExp):ConditionFn => (req: Request) => {
  const url = new URL(req.url)
  const path = url.pathname
  return (path.match(regExp) && path.match(regExp)![0] === path)!
}

interface HandlerFn {
  (req:Request): PromiseLike<Response>;
}

/**
 * Router handles the logic of what handler is matched given conditions
 * for each request
 *  */
export class Router {
  routes:{conditions:Conditions, handler:HandlerFn}[] = []

  handle(conditions:Conditions, handler:HandlerFn) {
    this.routes.push({
      conditions,
      handler,
    })
    return this
  }

  get(url:string|RegExp, handler:HandlerFn) {
    return this.handle([Get, Path(url)], handler)
  }

  post(url:string|RegExp, handler:HandlerFn) {
    return this.handle([Post, Path(url)], handler)
  }

  patch(url:string|RegExp, handler:HandlerFn) {
    return this.handle([Patch, Path(url)], handler)
  }

  delete(url:string|RegExp, handler:HandlerFn) {
    return this.handle([Delete, Path(url)], handler)
  }

  all(handler:HandlerFn) {
    return this.handle([], handler)
  }

  route(req:Request) {
    const route = this.resolve(req)

    if (route) {
      return route.handler(req)
    }

    return new Response('404', {
      status: 404,
      statusText: 'not found',
      headers: {
        'content-type': 'text/plain',
      },
    })
  }

  // resolve returns the matching route that returns true for
  // all the conditions if any
  resolve(req:Request) {
    return this.routes.find(r => {
      if (!r.conditions || (Array.isArray(r) && !r.conditions.length)) {
        return true
      }

      if (typeof r.conditions === 'function') {
        return r.conditions(req)
      }

      return r.conditions.every(c => c(req))
    })
  }
}

