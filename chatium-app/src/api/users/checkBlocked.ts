import BlockedUsers from "../../tables/blocked_users.table"

export async function isUserBlocked(ctx, userId) {
  const blocks = await BlockedUsers.findAll(ctx, { where: { userId, isActive: true } })
  if (blocks.length === 0) return { blocked: false }
  for (const b of blocks) {
    if (!b.isPermanent && b.blockedUntil && new Date(b.blockedUntil) < new Date()) {
      await BlockedUsers.update(ctx, { id: b.id, isActive: false })
      continue
    }
    return { blocked: true, reason: b.reason, isPermanent: !!b.isPermanent }
  }
  return { blocked: false }
}

export const apiUsersCheckBlockedRoute = app.post("/")
  .body(s => ({ userId: s.string().optional() }))
  .handle(async (ctx, req) => {
    const userId = req.body.userId || ctx.user?.id
    if (!userId) return { blocked: false }
    return { success: true, ...await isUserBlocked(ctx, userId) }
  })