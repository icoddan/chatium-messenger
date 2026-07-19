// @shared
import { requireRealUser } from "@app/auth"
import Groups from "../../tables/groups.table"
import GroupMembers from "../../tables/group_members.table"

export const apiGroupsDeleteRoute = app.post("/")
  .body(s => ({ groupId: s.string() }))
  .handle(async (ctx, req) => {
    requireRealUser(ctx)
    const group = await Groups.findById(ctx, req.body.groupId)
    if (!group) return { success: false, error: "Группа не найдена" }
    const ownerId = typeof group.ownerId === "object" ? (group.ownerId as any)?.id : group.ownerId
    if (ownerId !== ctx.user!.id && !ctx.user?.is("Staff")) return { success: false, error: "Нет прав" }
    const members = await GroupMembers.findAll(ctx, { where: { groupId: req.body.groupId }, limit: 1000 })
    for (const m of members) await GroupMembers.delete(ctx, m.id)
    await Groups.delete(ctx, req.body.groupId)
    return { success: true, message: "Группа удалена" }
  })