// @shared
import { requireRealUser } from "@app/auth"
import PremiumPlans from "../../tables/premium_plans.table"
import PremiumSubscriptions from "../../tables/premium_subscriptions.table"
import UserStars from "../../tables/user_stars.table"

export const apiPremiumSubscribeRoute = app.post("/")
  .body(s => ({ planId: s.string() }))
  .handle(async (ctx, req) => {
    requireRealUser(ctx)
    const plan = await PremiumPlans.findById(ctx, req.body.planId)
    if (!plan || !plan.isActive) return { success: false, error: "План не найден" }
    const existing = await PremiumSubscriptions.findAll(ctx, { where: { userId: ctx.user!.id, status: "active" }, limit: 1 })
    if (existing.length > 0) return { success: false, error: "У вас уже есть активная Premium подписка" }
    let starRecord = await UserStars.findOneBy(ctx, { userId: ctx.user!.id })
    const balance = starRecord?.balance || 0
    if (balance < (plan.priceStars || 0)) return { success: false, error: "Недостаточно звёзд", insufficientStars: true, requiredStars: plan.priceStars, currentBalance: balance }
    await UserStars.update(ctx, { id: starRecord!.id, balance: balance - (plan.priceStars || 0) })
    const now = new Date(); const expiresAt = new Date(now); expiresAt.setDate(expiresAt.getDate() + (plan.durationDays || 30))
    const sub = await PremiumSubscriptions.create(ctx, { userId: ctx.user!.id, planId: plan.id, status: "active", startedAt: now, expiresAt, autoRenew: false })
    return { success: true, isPremium: true, subscription: { id: sub.id, planId: plan.id, status: "active", startedAt: now, expiresAt, daysLeft: plan.durationDays || 30 } }
  })