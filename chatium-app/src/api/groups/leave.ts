// @shared
import { requireRealUser } from "@app/auth"
import Groups from "../../tables/groups.table"
import GroupMembers from "../../tables/group_members.table"

export const apiGroupsLeaveRoute = app.post("/")
  .body(s => ({ groupId: s.string() }))
  .handle(async (ctx, req) => {
    requireRealUser(ctx)
    const group = await Groups.findById(ctx, req.body.groupId)
    if (!group) return { success: false, error: "Группа не найдена" }
    const [membership] = await GroupMembers.findAll(ctx, { where: { groupId: req.body.groupId, userId: ctx.user!.id }, limit: 1 })
    if (!membership) return { success: false, error: "Вы не являетесь участником" }
    if (membership.role === "owner") return { success: false, error: "Владелец не может покинуть группу" }
    await GroupMembers.delete(ctx, membership.id)
    return { success: true, message: group.type === "channel" ? "Вы отписались" : "Вы покинули группу" }
  })