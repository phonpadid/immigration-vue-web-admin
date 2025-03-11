import type { MiddlewareContext } from '@/lib/middlewares/index'

export default function auth(context: MiddlewareContext) {
  if (!localStorage.getItem('access_token')) {
    return context.router.push({ name: 'login' }).catch(() => {})
  }
  return context.next
}
