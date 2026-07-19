// @shared
import { requireRealUser } from "@app/auth"
import Groups, { GroupRow } from "../../tables/groups.table"
import VerificationRequests from "../../tables/verification_requests.table"
import GroupMembers from "../../tables/group_members.table"

export const apiVerificationRequestRoute = app.post("/")
  .body(s => ({ username: s.string(), supportChatExternalId: s.string() }))
  .handle(async (ctx, req) => {
    requireRealUser(ctx)
    const cleanUsername = req.body.username.replace(/^@/, "")
    const [group] = await Groups.findAll(ctx, { where: { username: cleanUsername }, limit: 1 })
    if (!group) return { success: false, error: "Группа/канал не найдена" }
    if (group.isVerified) return { success: false, error: "Уже верифицирована" }
    await VerificationRequests.create(ctx, { groupId: group.id, requestedBy: ctx.user!.id, status: "pending", supportChatExternalId: req.body.supportChatExternalId })
    return { success: true, message: "Запрос отправлен" }
  })