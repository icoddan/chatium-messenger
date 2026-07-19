import { requireAccountRole } from "@app/auth"
import { getThumbnailUrl } from "@app/storage"
import Profiles from "../../tables/profiles.table"

export const apiUsersVerifyRoute = app.post("/")
  .body(s => ({ userId: s.string(), verify: s.boolean() }))
  .handle(async (ctx, req) => {
    requireAccountRole(ctx, "Staff")
    const { userId, verify } = req.body
    const [profile] = await Profiles.findAll(ctx, { where: { userId }, limit: 1 })
    if (!profile) return { success: false, error: "Профиль пользователя не найден" }
    const updated = await Profiles.update(ctx, { id: profile.id, isVerified: verify, verifiedBy: verify ? ctx.user!.id : "", verifiedAt: verify ? new Date() : null })
    return { success: true, isVerified: verify, profile: { ...updated, avatarUrl: updated.avatarHash ? getThumbnailUrl(ctx, updated.avatarHash, 120, 120) : null } }
  })