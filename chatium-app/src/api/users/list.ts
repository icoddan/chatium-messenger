import { findUsersByIds } from "@app/auth"
import { getThumbnailUrl } from "@app/storage"
import Profiles from "../../tables/profiles.table"
import BlockedUsers from "../../tables/blocked_users.table"

export const apiUsersListRoute = app.post("/")
  .body(s => ({ search: s.string().optional(), unverifiedOnly: s.boolean().optional(), includeBlocked: s.boolean().optional() }))
  .handle(async (ctx, req) => {
    const { search, unverifiedOnly, includeBlocked } = req.body
    let profiles = await Profiles.findAll(ctx, { where: unverifiedOnly ? { isVerified: { $not: true } } : {}, limit: 1000, order: [{ createdAt: "desc" }] })
    profiles = profiles.filter(p => !!p.userId)
    if (search) { const q = search.toLowerCase(); profiles = profiles.filter(p => (p.displayName || "").toLowerCase().includes(q) || (p.username || "").toLowerCase().includes(q)) }
    const activeBlocks = await BlockedUsers.findAll(ctx, { where: { isActive: true }, limit: 1000 })
    const blockedIds = new Set(activeBlocks.filter(b => b.isPermanent || !b.blockedUntil || new Date(b.blockedUntil) >= new Date()).map(b => b.userId))
    if (!includeBlocked) profiles = profiles.filter(p => !blockedIds.has(p.userId))
    const users = await findUsersByIds(ctx, profiles.map(p => p.userId))
    const usersMap = new Map(users.map(u => [u.id, u]))
    const isAdmin = ctx.user?.is("Admin") || false
    const result = profiles.map(p => ({ id: p.id, userId: p.userId, displayName: p.displayName || usersMap.get(p.userId)?.displayName || "Unknown", username: p.username || ("user_" + p.userId.slice(-8)), bio: p.bio || "", isVerified: !!p.isVerified, avatarUrl: p.avatarHash ? getThumbnailUrl(ctx, p.avatarHash, 120, 120) : null, accountRole: usersMap.get(p.userId)?.accountRole || "User", email: isAdmin ? (usersMap.get(p.userId)?.confirmedEmail || "") : "", serialNumber: p.serialNumber }))
    return { success: true, users: result }
  })