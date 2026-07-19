// @shared
import SupportTickets from "../../tables/support_tickets.table"

export const apiSupportMyTicketRoute = app.post("/")
  .body(s => ({ }))
  .handle(async (ctx, req) => {
    const uid = ctx.user?.id
    if (!uid) return { success: false, ticket: null }
    const tickets = await SupportTickets.findAll(ctx, { where: { userId: uid }, limit: 1, order: [{ createdAt: "desc" }] })
    if (tickets.length === 0) return { success: true, ticket: null }
    const t = tickets[0]!
    return { success: true, ticket: { id: t.id, userId: uid, subject: t.subject || "Обращение", status: t.status, chatExternalId: t.chatExternalId, createdAt: t.createdAt } }
  })