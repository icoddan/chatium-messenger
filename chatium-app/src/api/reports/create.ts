// @shared
import { requireRealUser } from "@app/auth"
import Reports from "../../tables/reports.table"

export const apiReportsCreateRoute = app.post("/")
  .body(s => ({ targetUserId: s.string(), reason: s.string(), description: s.string().optional() }))
  .handle(async (ctx, req) => {
    requireRealUser(ctx)
    if (req.body.targetUserId === ctx.user!.id) return { success: false, error: "Нельзя на себя" }
    const existing = await Reports.findAll(ctx, { where: { userId: ctx.user!.id, targetUserId: req.body.targetUserId, status: "pending" }, limit: 1 })
    if (existing.length > 0) return { success: false, error: "Вы уже отправили жалобу" }
    await Reports.create(ctx, { userId: ctx.user!.id, targetUserId: req.body.targetUserId, reason: req.body.reason, description: req.body.description || "", status: "pending" })
    return { success: true, message: "Жалоба отправлена" }
  })