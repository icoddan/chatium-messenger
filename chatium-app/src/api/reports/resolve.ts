// @shared
import { requireAccountRole } from "@app/auth"
import Reports from "../../tables/reports.table"

export const apiReportsResolveRoute = app.post("/")
  .body(s => ({ reportId: s.string(), action: s.enum(["resolve", "dismiss"]) }))
  .handle(async (ctx, req) => {
    requireAccountRole(ctx, "Staff")
    const report = await Reports.findById(ctx, req.body.reportId)
    if (!report) return { success: false, error: "Жалоба не найдена" }
    await Reports.update(ctx, { id: req.body.reportId, status: req.body.action === "resolve" ? "resolved" : "dismissed", resolvedBy: ctx.user!.id, resolvedAt: new Date() })
    return { success: true, message: req.body.action === "resolve" ? "Жалоба принята" : "Жалоба отклонена" }
  })