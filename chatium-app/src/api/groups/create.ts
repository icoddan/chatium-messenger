// @shared
import { requireRealUser } from "@app/auth"
import Groups from "../../tables/groups.table"
import GroupMembers from "../../tables/group_members.table"
import Profiles from "../../tables/profiles.table"
import { isUserBlocked } from "../users/checkBlocked"

export const apiGroupsCreateRoute = app.post("/")
  .body(s => ({ name: s.string(), type: s.enum(["group", "channel"]), description: s.string().optional(), username: s.string().optional(), isPublic: s.boolean().optional() }))
  .handle(async (ctx, req) => {
    requireRealUser(ctx)
    const { name, type, description, username, isPublic } = req.body
    if ((await isUserBlocked(ctx, ctx.user!.id)).blocked) return { success: false, error: "Вы заблокированы" }
    const chatExternalId = "groupchat_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8)
    const group = await Groups.create(ctx, { name, description: description || "", type, ownerId: ctx.user!.id, username: (username || "").toLowerCase().replace(/^@/, ""), avatarHash: "", isVerified: false, isPublic: isPublic !== false, chatExternalId })
    await GroupMembers.create(ctx, { groupId: group.id, userId: ctx.user!.id, role: "owner", joinedAt: new Date() })
    return { success: true, group: { id: group.id, name: group.name, type: group.type, description: group.description, chatExternalId: group.chatExternalId } }
  })