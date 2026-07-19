// @shared
import Groups from "../../tables/groups.table"
import GroupMembers from "../../tables/group_members.table"
import { findUsersByIds } from "@app/auth"

export const apiGroupsMembersRoute = app.post("/")
  .body(s => ({ groupId: s.string() }))
  .handle(async (ctx, req) => {
    const group = await Groups.findById(ctx, req.body.groupId)
    if (!group) return { success: false, error: "Группа не найдена", members: [] }
    const members = await GroupMembers.findAll(ctx, { where: { groupId: req.body.groupId }, limit: 1000 })
    const userIds = members.map(m => typeof m.userId === "object" ? (m.userId as any)?.id : m.userId).filter(Boolean)
    const users = await findUsersByIds(ctx, userIds)
    const usersMap = new Map(users.map(u => [u.id, u]))
    const result = members.map(m => ({ id: m.id, userId: (typeof m.userId === "object" ? (m.userId as any)?.id : m.userId) || "", displayName: usersMap.get(typeof m.userId === "object" ? (m.userId as any)?.id : m.userId)?.displayName || "Пользователь", role: m.role || "member" }))
    return { success: true, members: result, memberCount: result.length }
  })