// @shared
import { findUserById } from "@app/auth"
import Dialogs from "../../tables/dialogs.table"

export const apiChatsListRoute = app.post("/")
  .body(s => ({ search: s.string().optional() }))
  .handle(async (ctx, req) => {
    const uid = ctx.user?.id
    if (!uid) return { success: false, error: "Не авторизован", chats: [] }
    let dialogs = await Dialogs.findAll(ctx, { limit: 1000, order: [{ lastMessageAt: "desc" }] })
    dialogs = dialogs.filter(d => d.participant1?.id === uid || d.participant2?.id === uid)
    const result = []
    for (const d of dialogs) {
      const p1 = d.participant1?.id || ""; const p2 = d.participant2?.id || ""
      const partnerId = p1 === uid ? p2 : p1
      let partnerName = "Пользователь"
      if (partnerId) { try { const u = await findUserById(ctx, partnerId); partnerName = u?.displayName || u?.firstName || "Пользователь" } catch {} }
      result.push({ id: d.id, dialogExternalId: d.dialogExternalId, partnerUserId: partnerId, partnerName, partnerAvatarUrl: null, lastMessageText: d.lastMessageText || "", lastMessageAt: d.lastMessageAt instanceof Date ? d.lastMessageAt.toISOString() : String(d.lastMessageAt || ""), lastMessageBy: d.lastMessageBy?.id || "", unreadCount: d.unreadCount || 0 })
    }
    return { success: true, chats: result }
  })