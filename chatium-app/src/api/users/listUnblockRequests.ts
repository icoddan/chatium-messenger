// @shared
import { requireAccountRole, findUsersByIds } from "@app/auth"
import UnblockRequests from "../../tables/unblock_requests.table"
import Profiles from "../../tables/profiles.table"

export const apiUsersListUnblockRequestsRoute = app.post("/")
  .body(s => ({ status: s.string().optional() }))
  .handle(async (ctx, req) => {
    requireAccountRole(ctx, "Staff")
    const where: any = {}
    if (req.body.status && req.body.status !== "all") where.status = req.body.status
    const requests = await UnblockRequests.findAll(ctx, { where, limit: 1000, order: [{ createdAt: "desc" }] })
    if (requests.length === 0) return { success: true, requests: [] }
    const userIds = requests.map(r => r.userId as string)
    const profiles = await Profiles.findAll(ctx, { limit: 1000 })
    const profilesMap = new Map(profiles.map(p => [p.userId as string, p]))
    const users = await findUsersByIds(ctx, userIds)
    const usersMap = new Map(users.map(u => [u.id, u]))
    const result = requests.map(r => {
      const uid = r.userId as string
      return { id: r.id, userId: uid, displayName: profilesMap.get(uid)?.displayName || usersMap.get(uid)?.displayName || "Пользователь", username: profilesMap.get(uid)?.username || ("user_" + uid.slice(-8)), status: r.status, message: r.message || "", supportTicketId: r.supportTicketId || "" }
    })
    return { success: true, requests: result }
  })