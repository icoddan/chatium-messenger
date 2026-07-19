// @shared
import { requireRealUser } from "@app/auth"
import SupportTickets from "../../tables/support_tickets.table"
import { isUserBlocked } from "../users/checkBlocked"

export const apiStarsRequestRoute = app.post("/")
  .body(s => ({ amount: s.number().optional(), message: s.string().optional() }))
  .handle(async (ctx, req) => {
    requireRealUser(ctx)
    const uid = ctx.user!.id
    if ((await isUserBlocked(ctx, uid)).blocked) return { success: false, error: "Заблокированы" }
    const amount = req.body.amount || 10
    const existing = await SupportTickets.findAll(ctx, { where: { userId: uid, status: ["open", "in_progress"] }, limit: 1 })
    if (existing.length > 0) return { success: true, ticket: { id: existing[0]!.id, userId: uid, subject: existing[0]!.subject || "Запрос звёзд", status: existing[0]!.status, chatExternalId: existing[0]!.chatExternalId }, existing: true }
    const chatExternalId = "support_" + uid + "_" + Date.now()
    const subject = req.body.message ? "Запрос звёзд: " + amount + " ⭐ — " + req.body.message : "Запрос звёзд: " + amount + " ⭐"
    const t = await SupportTickets.create(ctx, { userId: uid, subject, status: "open", chatExternalId })
    return { success: true, ticket: { id: t.id, userId: uid, subject: t.subject, status: t.status, chatExternalId: t.chatExternalId, amount }, existing: false }
  })