// @shared
import { requireAccountRole } from "@app/auth"
import UnblockRequests from "../../tables/unblock_requests.table"
import BlockedUsers from "../../tables/blocked_users.table"

export const apiUsersProcessUnblockRequestRoute = app.post("/")
  .body(s => ({ userId: s.string(), action: s.enum(["approve", "reject"]), supportTicketId: s.string().optional() }))
  .handle(async (ctx, req) => {
    requireAccountRole(ctx, "Staff")
    const [request] = await UnblockRequests.findAll(ctx, { where: { userId: req.body.userId, status: "pending" }, limit: 1 })
    if (!request) return { success: false, error: "Запрос не найден" }
    await UnblockRequests.update(ctx, { id: request.id, status: req.body.action === "approve" ? "approved" : "rejected", processedBy: ctx.user!.id, processedAt: new Date() })
    if (req.body.action === "approve") {
      const blocks = await BlockedUsers.findAll(ctx, { where: { userId: req.body.userId, isActive: true } })
      for (const b of blocks) await BlockedUsers.update(ctx, { id: b.id, isActive: false })
      return { success: true, message: "Пользователь разблокирован" }
    }
    return { success: true, message: "Запрос отклонён" }
  })