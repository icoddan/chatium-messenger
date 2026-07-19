// @shared
import { requireRealUser } from "@app/auth"
import UserStars from "../../tables/user_stars.table"

export const apiStarsGetRoute = app.post("/")
  .body(s => ({}))
  .handle(async (ctx, req) => {
    requireRealUser(ctx)
    let starRecord = await UserStars.findOneBy(ctx, { userId: ctx.user!.id })
    if (!starRecord) starRecord = await UserStars.create(ctx, { userId: ctx.user!.id, balance: 10 })
    return { success: true, balance: starRecord.balance || 0, userId: ctx.user!.id }
  })