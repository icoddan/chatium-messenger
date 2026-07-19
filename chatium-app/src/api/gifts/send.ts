// @shared
import { requireRealUser } from "@app/auth"
import SentGifts from "../../tables/sent_gifts.table"
import Gifts from "../../tables/gifts.table"

export const apiGiftsSendRoute = app.post("/")
  .body(s => ({ giftId: s.string(), toUserId: s.string(), message: s.string().optional() }))
  .handle(async (ctx, req) => {
    requireRealUser(ctx)
    if (ctx.user!.id === req.body.toUserId) return { success: false, error: "Нельзя себе" }
    const gift = await Gifts.findById(ctx, req.body.giftId)
    if (!gift) return { success: false, error: "Подарок не найден" }
    const sent = await SentGifts.create(ctx, { giftId: req.body.giftId, fromUserId: ctx.user!.id, toUserId: req.body.toUserId, message: req.body.message || "", giftName: gift.name || "Подарок", giftEmoji: gift.emoji || "🎁", giftBackdrop: gift.backdropColor || "#FFD700", isHidden: false })
    return { success: true, sentGift: { id: sent.id, giftId: sent.giftId, giftName: sent.giftName, giftEmoji: sent.giftEmoji, giftBackdrop: sent.giftBackdrop, message: sent.message } }
  })