// @shared
import { requireAccountRole } from "@app/auth"
import Groups from "../../tables/groups.table"
import VerificationRequests from "../../tables/verification_requests.table"
import { sendDataToSocket } from "@app/socket"

export const apiVerificationProcessRoute = app.post("/")
  .body(s => ({ groupId: s.string(), action: s.enum(["approve", "reject"]), supportChatExternalId: s.string() }))
  .handle(async (ctx, req) => {
    requireAccountRole(ctx, "Staff")
    const [request] = await VerificationRequests.findAll(ctx, { where: { groupId: req.body.groupId, status: "pending" }, limit: 1 })
    if (!request) return { success: false, error: "Нет активного запроса" }
    const group = await Groups.findById(ctx, req.body.groupId)
    if (!group) return { success: false, error: "Группа не найдена" }
    if (req.body.action === "approve") {
      await Groups.update(ctx, { id: group.id, isVerified: true, verifiedBy: ctx.user!.id, verifiedAt: new Date() })
      await VerificationRequests.update(ctx, { id: request.id, status: "approved", processedBy: ctx.user!.id, processedAt: new Date() })
      try { await sendDataToSocket(ctx, req.body.supportChatExternalId, { type: "verification-result", data: { groupId: group.id, groupName: group.name, action: "approved", message: "✅ Группа верифицирована!" } }) } catch {}
      return { success: true, message: "✅ Верифицирована" }
    } else {
      await VerificationRequests.update(ctx, { id: request.id, status: "rejected", processedBy: ctx.user!.id, processedAt: new Date() })
      try { await sendDataToSocket(ctx, req.body.supportChatExternalId, { type: "verification-result", data: { groupId: group.id, groupName: group.name, action: "rejected", message: "❌ Отклонена" } }) } catch {}
      return { success: true, message: "❌ Отклонена" }
    }
  })