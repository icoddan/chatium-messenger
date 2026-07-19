// @shared
import { isUserBlocked } from "./checkBlocked"

export const apiUsersBlockStatusRoute = app.post("/")
  .body(s => ({ }))
  .handle(async (ctx, req) => {
    if (!ctx.user?.id) return { blocked: false }
    return { success: true, ...await isUserBlocked(ctx, ctx.user.id) }
  })