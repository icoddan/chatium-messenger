// @shared
import { genSocketId } from "@app/socket"

export const apiCallsGetSocketIdRoute = app.post("/")
  .body(s => ({ dialogId: s.string() }))
  .handle(async (ctx, req) => {
    if (!ctx.user?.id) return { success: false, error: "Не авторизован" }
    const encodedSocketId = await genSocketId(ctx, req.body.dialogId)
    return { success: true, encodedSocketId }
  })