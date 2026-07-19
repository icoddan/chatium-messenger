// @shared
import Groups from "../../tables/groups.table"
import GroupMembers from "../../tables/group_members.table"
import { findUserById } from "@app/auth"

export const apiGroupsInfoRoute = app.post("/")
  .body(s => ({ groupId: s.string() }))
  .handle(async (ctx, req) => {
    const group = await Groups.findById(ctx, req.body.groupId)
    if (!group) return { success: false, error: "Группа не найдена" }
    const members = await GroupMembers.findAll(ctx, { where: { groupId: req.body.groupId }, limit: 1000 })
    let ownerName = "Неизвестно"
    const ownerId = typeof group.ownerId === "object" ? (group.ownerId as any)?.id : group.ownerId
    if (ownerId) { try { const o = await findUserById(ctx, ownerId); if (o) ownerName = o.displayName || o.firstName || "Владелец" } catch {} }
    const isMember = !!members.find(m => (typeof m.userId === "object" ? (m.userId as any)?.id : m.userId) === ctx.user?.id)
    return { success: true, group: { id: group.id, name: group.name, description: group.description, type: group.type, username: group.username, isVerified: !!group.isVerified, isPublic: !!group.isPublic, chatExternalId: group.chatExternalId, ownerId, ownerName, memberCount: members.length, isMember } }
  })