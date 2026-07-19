// @shared
import Dialogs from "../../tables/dialogs.table"
import { isUserBlocked } from "../users/checkBlocked"

export const apiChatsUpdateLastMessageRoute = app.post("/")
  .body(s => ({ dialogExternalId: s.string(), partnerUserId: s.string(), text: s.string() }))
  .handle(async (ctx, req) => {
    const uid = ctx.user?.id
    if (!uid) return { success: false, error: "Не авторизован" }
    if ((await isUserBlocked(ctx, uid)).blocked) return { success: false, error: "Вы заблокированы" }
    const { partnerUserId, text } = req.body
    const sorted = [uid, partnerUserId].sort(); const eid = "dialog_" + sorted[0] + "_" + sorted[1]
    const [existing] = await Dialogs.findAll(ctx, { where: { dialogExternalId: eid }, limit: 1 })
    if (existing) await Dialogs.update(ctx, { id: existing.id, lastMessageText: text, lastMessageAt: new Date(), lastMessageBy: uid, unreadCount: 0 })
    else await Dialogs.create(ctx, { participant1: sorted[0], participant2: sorted[1], dialogExternalId: eid, lastMessageText: text, lastMessageAt: new Date(), lastMessageBy: uid, unreadCount: 0 })
    return { success: true }
  })