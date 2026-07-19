// @shared
import { requireRealUser } from "@app/auth"
import SupportTickets from "../../tables/support_tickets.table"

export const apiSupportCreateTicketRoute = app.post("/")
  .body(s => ({ subject: s.string().optional() }))
  .handle(async (ctx, req) => {
    requireRealUser(ctx)
    const uid = ctx.user!.id
    const existing = await SupportTickets.findAll(ctx, { where: { userId: uid, status: ["open", "in_progress"] }, limit: 1 })
    if (existing.length > 0) return { success: true, ticket: { id: existing[0]!.id, userId: uid, subject: existing[0]!.subject || "Обращение", status: existing[0]!.status, chatExternalId: existing[0]!.chatExternalId }, existing: true }
    const chatExternalId = "support_" + uid + "_" + Date.now()
    const t = await SupportTickets.create(ctx, { userId: uid, subject: req.body.subject || "Обращение в техподдержку", status: "open", chatExternalId })
    return { success: true, ticket: { id: t.id, userId: uid, subject: t.subject, status: t.status, chatExternalId: t.chatExternalId }, existing: false }
  })