// @shared
import { requireAccountRole } from "@app/auth"
import PremiumPlans from "../../tables/premium_plans.table"
import PremiumSubscriptions from "../../tables/premium_subscriptions.table"

export const apiPremiumGrantRoute = app.post("/")
  .body(s => ({ userId: s.string(), planId: s.string().optional(), durationDays: s.number().optional() }))
  .handle(async (ctx, req) => {
    requireAccountRole(ctx, "Staff")
    const existingSubs = await PremiumSubscriptions.findAll(ctx, { where: { userId: req.body.userId, status: "active" }, limit: 1 })
    for (const sub of existingSubs) await PremiumSubscriptions.update(ctx, { id: sub.id, status: "expired" })
    let durationDays = req.body.durationDays || 30
    if (req.body.planId) { const plan = await PremiumPlans.findById(ctx, req.body.planId); if (plan?.durationDays) durationDays = plan.durationDays }
    const now = new Date(); const expiresAt = new Date(now); expiresAt.setDate(expiresAt.getDate() + durationDays)
    const sub = await PremiumSubscriptions.create(ctx, { userId: req.body.userId, planId: req.body.planId || "default", status: "active", startedAt: now, expiresAt, autoRenew: false, grantedBy: ctx.user!.id })
    return { success: true, subscription: { id: sub.id, userId: req.body.userId, status: "active", startedAt: now, expiresAt, daysLeft: durationDays } }
  })