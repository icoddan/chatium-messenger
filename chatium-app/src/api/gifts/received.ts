// @shared
import SentGifts from "../../tables/sent_gifts.table"
import { findUsersByIds } from "@app/auth"

export const apiGiftsReceivedRoute = app.post("/")
  .body(s => ({ userId: s.string() }))
  .handle(async (ctx, req) => {
    const uid = ctx.user?.id || ""
    const isOwn = req.body.userId === uid
    const where: any = { toUserId: req.body.userId }
    if (!isOwn) where.isHidden = false
    const gifts = await SentGifts.findAll(ctx, { where, order: [{ createdAt: "desc" }] })
    const senderIds = [...new Set(gifts.map(g => g.fromUserId?.id).filter(Boolean))] as string[]
    const senders = await findUsersByIds(ctx, senderIds)
    const senderMap = new Map(senders.map(s => [s.id, s.displayName]))
    return { success: true, isOwnProfile: isOwn, gifts: gifts.map(g => ({ id: g.id, giftId: g.giftId, giftName: g.giftName, giftEmoji: g.giftEmoji, giftBackdrop: g.giftBackdrop, message: g.message, fromUserId: g.fromUserId?.id || "", fromName: senderMap.get(g.fromUserId?.id || "") || "Пользователь", createdAt: g.createdAt, isHidden: !!g.isHidden })) }
  })