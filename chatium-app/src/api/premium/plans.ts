// @shared
import { requireRealUser } from "@app/auth"
import PremiumPlans from "../../tables/premium_plans.table"

export const apiPremiumPlansRoute = app.post("/")
  .body(s => ({}))
  .handle(async (ctx, req) => {
    requireRealUser(ctx)
    const plans = await PremiumPlans.findAll(ctx, { where: { isActive: true }, order: [{ sortOrder: "asc" }] })
    return { success: true, plans: plans.map(p => ({ id: p.id, name: p.name, description: p.description, priceStars: p.priceStars, durationDays: p.durationDays, badgeColor: p.badgeColor || "#6c5ce7", icon: p.icon || "fa-crown", features: p.features ? JSON.parse(p.features) : [], sortOrder: p.sortOrder })) }
  })