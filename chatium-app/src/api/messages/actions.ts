// @shared
import { requireRealUser } from "@app/auth"
import MessageActions from "../../tables/message_actions.table"

export const apiMessagesActionsRoute = app.post("/")
  .body(s => ({ chatExternalId: s.string() }))
  .handle(async (ctx, req) => {
    requireRealUser(ctx)
    const actions = await MessageActions.findAll(ctx, { where: { chatExternalId: req.body.chatExternalId }, order: [{ createdAt: "desc" }] })
    const deletedIds = new Set<string>()
    const editedTexts: Record<string, string> = {}
    for (const a of actions) {
      if (a.action === "delete" && a.messageId) deletedIds.add(a.messageId)
      else if (a.action === "edit" && a.messageId && !editedTexts[a.messageId]) editedTexts[a.messageId] = a.newText || ""
    }
    return { success: true, deletedMessageIds: Array.from(deletedIds), editedMessages: editedTexts }
  })