// @shared
import { requireAccountRole, findUsersByIds } from "@app/auth"
import Reports from "../../tables/reports.table"
import Profiles from "../../tables/profiles.table"

export const apiReportsListRoute = app.post("/")
  .body(s => ({ status: s.string().optional() }))
  .handle(async (ctx, req) => {
    requireAccountRole(ctx, "Staff")
    const where: any = {}
    if (req.body.status) where.status = req.body.status
    const reports = await Reports.findAll(ctx, { where, limit: 1000, order: [{ createdAt: "desc" }] })
    const allIds = new Set<string>()
    reports.forEach(r => { const uid = typeof r.userId === "object" ? (r.userId as any)?.id : r.userId; if (uid) allIds.add(uid); if (r.targetUserId) allIds.add(r.targetUserId as string) })
    const users = await findUsersByIds(ctx, Array.from(allIds))
    const usersMap = new Map(users.map(u => [u.id, u]))
    const result = reports.map(r => {
      const reporterId = typeof r.userId === "object" ? (r.userId as any)?.id : r.userId
      return { id: r.id, reporterId: reporterId || "", reporterName: usersMap.get(reporterId)?.displayName || "Неизвестно", targetUserId: r.targetUserId || "", targetName: usersMap.get(r.targetUserId as string)?.displayName || "Неизвестно", reason: r.reason, description: r.description, status: r.status, createdAt: r.createdAt }
    })
    return { success: true, reports: result }
  })