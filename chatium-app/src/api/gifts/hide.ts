// @shared
import { requireRealUser } from "@app/auth"
import SentGifts from "../../tables/sent_gifts.table"

export const apiGiftsHideRoute = app.post("/")
  .body(s => ({ giftId: s.string(), hidden: s.boolean() }))
  .handle(async (ctx, req) => {
    requireRealUser(ctx)
    const gift = await SentGifts.findById(ctx, req.body.giftId)
    if (!gift) return { success: false, error: "Подарок не найден" }
    if ((gift.toUserId?.id || "") !== ctx.user!.id) return { success: false, error: "Нельзя скрыть чужой подарок" }
    await SentGifts.update(ctx, { id: req.body.giftId, isHidden: req.body.hidden })
    return { success: true, hidden: req.body.hidden }
  })