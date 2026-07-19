// @shared
import { requireRealUser } from "@app/auth"
import PremiumSubscriptions from "../../tables/premium_subscriptions.table"

export const apiPremiumCancelRoute = app.post("/")
  .body(s => ({}))
  .handle(async (ctx, req) => {
    requireRealUser(ctx)
    const [sub] = await PremiumSubscriptions.findAll(ctx, { where: { userId: ctx.user!.id, status: "active" }, limit: 1 })
    if (!sub) return { success: false, error: "Нет активной подписки" }
    await PremiumSubscriptions.update(ctx, { id: sub.id, autoRenew: false })
    return { success: true, message: "Автопродление отключено", expiresAt: sub.expiresAt }
  })