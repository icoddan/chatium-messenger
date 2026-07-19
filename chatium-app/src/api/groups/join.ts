// @shared
import { requireRealUser } from "@app/auth"
import Groups from "../../tables/groups.table"
import GroupMembers from "../../tables/group_members.table"

export const apiGroupsJoinRoute = app.post("/")
  .body(s => ({ groupId: s.string() }))
  .handle(async (ctx, req) => {
    requireRealUser(ctx)
    const group = await Groups.findById(ctx, req.body.groupId)
    if (!group) return { success: false, error: "Группа не найдена" }
    const existing = await GroupMembers.findAll(ctx, { where: { groupId: req.body.groupId, userId: ctx.user!.id }, limit: 1 })
    if (existing.length > 0) return { success: false, error: "Вы уже присоединились" }
    const role = group.type === "channel" ? "subscriber" : "member"
    await GroupMembers.create(ctx, { groupId: req.body.groupId, userId: ctx.user!.id, role, joinedAt: new Date() })
    return { success: true, message: group.type === "channel" ? "Вы подписались на канал" : "Вы присоединились к группе" }
  })