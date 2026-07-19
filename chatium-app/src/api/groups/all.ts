// @shared
import Groups from "../../tables/groups.table"
import GroupMembers from "../../tables/group_members.table"

export const apiGroupsAllRoute = app.post("/")
  .body(s => ({ type: s.enum(["group", "channel"]).optional(), search: s.string().optional() }))
  .handle(async (ctx, req) => {
    const where = { isPublic: true } as any
    if (req.body.type) where.type = req.body.type
    let groups = await Groups.findAll(ctx, { where, limit: 1000, order: [{ createdAt: "desc" }] })
    if (req.body.search) { const q = req.body.search.toLowerCase(); groups = groups.filter(g => (g.name || "").toLowerCase().includes(q) || (g.description || "").toLowerCase().includes(q)) }
    const uid = ctx.user?.id
    let memberships = [] as any[]
    if (uid) memberships = await GroupMembers.findAll(ctx, { where: { userId: uid }, limit: 1000 })
    const result = groups.map(g => ({ id: g.id, name: g.name, description: g.description, type: g.type, username: g.username, isVerified: !!g.isVerified, isPublic: !!g.isPublic, chatExternalId: g.chatExternalId, isJoined: !!memberships.find(m => m.groupId === g.id) }))
    return { success: true, groups: result }
  })