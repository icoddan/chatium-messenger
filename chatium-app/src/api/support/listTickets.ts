// @shared
import { requireAccountRole, findUsersByIds } from "@app/auth"
import SupportTickets from "../../tables/support_tickets.table"

export const apiSupportListTicketsRoute = app.post("/")
  .body(s => ({ status: s.string().optional() }))
  .handle(async (ctx, req) => {
    if (!ctx.user?.is("Staff") && !ctx.user?.is("Admin")) return { success: false, error: "Нет доступа", tickets: [] }
    const where = {} as any
    if (req.body.status && req.body.status !== "all") where.status = req.body.status
    let tickets = await SupportTickets.findAll(ctx, { where, limit: 1000, order: [{ createdAt: "desc" }] })
    const userIds = tickets.map(t => { const uid = typeof t.userId === "object" ? (t.userId as any)?.id : t.userId; return uid || "" }).filter(Boolean)
    const users = await findUsersByIds(ctx, userIds)
    const usersMap = new Map(users.map(u => [u.id, u]))
    const result = tickets.map(t => ({ id: t.id, userId: (typeof t.userId === "object" ? (t.userId as any)?.id : t.userId) || "", userName: usersMap.get(typeof t.userId === "object" ? (t.userId as any)?.id : t.userId)?.displayName || "Пользователь", subject: t.subject || "Обращение", status: t.status || "open", chatExternalId: t.chatExternalId, createdAt: t.createdAt }))
    return { success: true, tickets: result }
  })