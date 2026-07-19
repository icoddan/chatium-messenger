// @shared
import { requireRealUser } from "@app/auth"
import PremiumSubscriptions from "../../tables/premium_subscriptions.table"

export const apiPremiumStatusRoute = app.post("/")
  .body(s => ({ userId: s.string().optional() }))
  .handle(async (ctx, req) => {
    const targetUserId = req.body.userId || ctx.user?.id
    if (!targetUserId) return { success: false, isPremium: false }
    const [sub] = await PremiumSubscriptions.findAll(ctx, { where: { userId: targetUserId, status: "active" }, order: [{ expiresAt: "desc" }], limit: 1 })
    if (!sub) return { success: true, isPremium: false }
    const expiresAt = sub.expiresAt ? new Date(sub.expiresAt) : null
    if (expiresAt && expiresAt < new Date()) { await PremiumSubscriptions.update(ctx, { id: sub.id, status: "expired" }); return { success: true, isPremium: false } }
    const daysLeft = expiresAt ? Math.ceil((expiresAt.getTime() - Date.now()) / 86400000) : 0
    return { success: true, isPremium: true, subscription: { id: sub.id, planId: sub.planId, status: sub.status, startedAt: sub.startedAt, expiresAt: sub.expiresAt, autoRenew: !!sub.autoRenew, daysLeft } }
  })