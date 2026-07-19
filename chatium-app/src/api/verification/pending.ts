// @shared
import { requireAccountRole } from "@app/auth"
import Groups from "../../tables/groups.table"
import VerificationRequests from "../../tables/verification_requests.table"

export const apiVerificationPendingRoute = app.post("/")
  .body(s => ({ }))
  .handle(async (ctx, req) => {
    requireAccountRole(ctx, "Staff")
    const requests = await VerificationRequests.findAll(ctx, { where: { status: "pending" }, limit: 1000, order: [{ createdAt: "desc" }] })
    const result = []
    for (const r of requests) {
      const group = r.groupId ? await Groups.findById(ctx, r.groupId) : null
      result.push({ id: r.id, groupId: r.groupId, groupName: group?.name || "Неизвестно", groupUsername: group?.username || "", type: group?.type || "", requestedBy: r.requestedBy, status: r.status, supportChatExternalId: r.supportChatExternalId, createdAt: r.createdAt })
    }
    return { success: true, requests: result }
  })