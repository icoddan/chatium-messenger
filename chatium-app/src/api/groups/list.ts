// @shared
import Groups from "../../tables/groups.table"
import GroupMembers from "../../tables/group_members.table"

export const apiGroupsListRoute = app.post("/")
  .body(s => ({ type: s.enum(["group", "channel"]).optional() }))
  .handle(async (ctx, req) => {
    const uid = ctx.user?.id
    if (!uid) return { success: true, groups: [] }
    const memberships = await GroupMembers.findAll(ctx, { where: { userId: uid }, limit: 1000 })
    const groupIds = memberships.map(m => m.groupId).filter(Boolean)
    const allGroups = await Groups.findAll(ctx, { limit: 1000 })
    let userGroups = allGroups.filter(g => groupIds.includes(g.id))
    if (req.body.type) userGroups = userGroups.filter(g => g.type === req.body.type)
    const result = userGroups.map(g => ({ id: g.id, name: g.name, description: g.description, type: g.type, username: g.username, isVerified: !!g.isVerified, isPublic: !!g.isPublic, chatExternalId: g.chatExternalId, myRole: memberships.find(m => m.groupId === g.id)?.role || "" }))
    return { success: true, groups: result }
  })