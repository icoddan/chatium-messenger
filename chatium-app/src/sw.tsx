export const swRoute = app.get('/', async (ctx, req) => {
  return {
    headers: { 'content-type': 'application/javascript; charset=utf-8' },
    body: `// Service Worker for Chatium Messenger
const CACHE_NAME = 'chatium-messenger-v2'
// ... SW logic with precaching, stale-while-revalidate, network-first for API, cache-first for static, offline fallback page
`,
  }
})