// @shared
import { requireRealUser } from "@app/auth"
import UnblockRequests from "../../tables/unblock_requests.table"
import { isUserBlocked } from "./checkBlocked"

export const apiUsersRequestUnblockRoute = app.post("/")
  .body(s => ({ supportTicketId: s.string().optional(), message: s.string().optional() }))
  .handle(async (ctx, req) => {
    requireRealUser(ctx)
    if (!(await isUserBlocked(ctx, ctx.user!.id)).blocked) return { success: false, error: "Вы не заблокированы" }
    const [existing] = await UnblockRequests.findAll(ctx, { where: { userId: ctx.user!.id, status: "pending" }, limit: 1 })
    if (existing) {
      await UnblockRequests.update(ctx, { id: existing.id, supportTicketId: req.body.supportTicketId || existing.supportTicketId, message: req.body.message || existing.message })
      return { success: true, message: "Запрос уже отправлен" }
    }
    await UnblockRequests.create(ctx, { userId: ctx.user!.id, supportTicketId: req.body.supportTicketId || "", status: "pending", message: req.body.message || "" })
    return { success: true, message: "Запрос отправлен" }
  })