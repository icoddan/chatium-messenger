import { findUserById } from "@app/auth"
import { getThumbnailUrl } from "@app/storage"
import Profiles from "../../tables/profiles.table"

export const apiProfileGetRoute = app.post("/")
  .body(s => ({ userId: s.string().optional() }))
  .handle(async (ctx, req) => {
    const targetUserId = req.body.userId || ctx.user?.id
    if (!targetUserId) return { success: false, error: "Пользователь не найден" }
    const [profile] = await Profiles.findAll(ctx, { where: { userId: targetUserId }, limit: 1 })
    const user = await findUserById(ctx, targetUserId)
    if (!user) return { success: false, error: "Пользователь не найден" }
    const isAdmin = ctx.user?.is("Admin") || false
    const showEmail = isAdmin || ctx.user?.id === targetUserId
    return {
      success: true,
      profile: profile ? { ...profile, serialNumber: profile.serialNumber, avatarUrl: profile.avatarHash ? getThumbnailUrl(ctx, profile.avatarHash, 120, 120) : null, backgroundUrl: profile.backgroundHash ? getThumbnailUrl(ctx, profile.backgroundHash, 800, 200) : null, musicUrl: profile.musicHash ? "https://fs.chatium.ru/get/" + profile.musicHash : null, musicName: profile.musicName || null } : null,
      user: { id: user.id, email: showEmail ? (user.confirmedEmail || user.username || "") : "", displayName: user.displayName, firstName: user.firstName, lastName: user.lastName, accountRole: user.accountRole, type: user.type },
    }
  })