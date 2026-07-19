// @shared
import { requireRealUser } from "@app/auth"
import MessageActions from "../../tables/message_actions.table"
import { isUserBlocked } from "../users/checkBlocked"

export const apiMessagesEditRoute = app.post("/")
  .body(s => ({ chatExternalId: s.string(), messageId: s.string(), newText: s.string() }))
  .handle(async (ctx, req) => {
    requireRealUser(ctx)
    if ((await isUserBlocked(ctx, ctx.user!.id)).blocked) return { success: false, error: "Заблокированы" }
    await MessageActions.create(ctx, { chatExternalId: req.body.chatExternalId, messageId: req.body.messageId, action: "edit", newText: req.body.newText, userId: ctx.user!.id })
    return { success: true }
  })