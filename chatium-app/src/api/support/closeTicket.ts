// @shared
import { requireAccountRole } from "@app/auth"
import SupportTickets from "../../tables/support_tickets.table"

export const apiSupportCloseTicketRoute = app.post("/")
  .body(s => ({ ticketId: s.string() }))
  .handle(async (ctx, req) => {
    requireAccountRole(ctx, "Staff")
    const t = await SupportTickets.findById(ctx, req.body.ticketId)
    if (!t) return { success: false, error: "Тикет не найден" }
    await SupportTickets.update(ctx, { id: req.body.ticketId, status: "closed" })
    return { success: true, message: "Тикет закрыт" }
  })