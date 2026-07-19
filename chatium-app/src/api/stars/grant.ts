// @shared
import { requireAccountRole } from "@app/auth"
import UserStars from "../../tables/user_stars.table"

export const apiStarsGrantRoute = app.post("/")
  .body(s => ({ userId: s.string(), amount: s.number(), reason: s.string().optional() }))
  .handle(async (ctx, req) => {
    requireAccountRole(ctx, "Staff")
    if (!req.body.amount) return { success: false, error: "Укажите количество" }
    let starRecord = await UserStars.findOneBy(ctx, { userId: req.body.userId })
    if (!starRecord) starRecord = await UserStars.create(ctx, { userId: req.body.userId, balance: 0 })
    const newBalance = (starRecord.balance || 0) + req.body.amount
    await UserStars.update(ctx, { id: starRecord.id, balance: newBalance })
    return { success: true, balance: newBalance, amountGranted: req.body.amount }
  })