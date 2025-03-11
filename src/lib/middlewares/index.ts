import auth from './auth'
import guest from './guest'
import type { NavigationGuardNext, RouteLocationNormalized, Router } from 'vue-router'

export declare interface MiddlewareContext {
  router: Router
  from: RouteLocationNormalized
  next: NavigationGuardNext
  to: RouteLocationNormalized
}

export function nextCheck(
  context: {
    from: any
    to: any
    next: any
  },
  middleware: any,
  index: number
) {
  const nextMiddleware = middleware[index]

  if (!nextMiddleware) return context.next()

  return (...parameters: any[]) => {
    context.next(...parameters)
    const nextMidd = nextCheck(context, middleware, index + 1)
    nextMiddleware({ ...context, nextMidd })
  }
}

export default {
  auth,
  guest
}
