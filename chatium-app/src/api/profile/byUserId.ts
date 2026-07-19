import { findUserById } from "@app/auth"
import { getThumbnailUrl } from "@app/storage"
import Profiles from "../../tables/profiles.table"

export interface UserProfileView { id: string; userId: string; displayName: string; username: string; bio: string; isVerified: boolean; verifiedBy?: string; verifiedAt?: string; serialNumber?: number; avatarUrl: string | null; backgroundUrl: string | null; musicUrl: string | null; musicName: string | null; email: string; accountRole: string; firstName: string; lastName: string }

export const apiProfileByUserIdRoute = app.post("/")
  .body(s => ({ userId: s.string() }))
  .handle(async (ctx, req) => {
    const { userId } = req.body
    const [profile] = await Profiles.findAll(ctx, { where: { userId }, limit: 1 })
    const user = await findUserById(ctx, userId)
    if (!user) return { success: false, error: "Пользователь не найден" }
    const isAdmin = ctx.user?.is("Admin") || false
    const result: UserProfileView = { id: profile?.id || "", userId: user.id, displayName: profile?.displayName || user.displayName || "User", username: profile?.username || ("user_" + userId.slice(-8)), bio: profile?.bio || "", isVerified: !!profile?.isVerified, verifiedBy: profile?.verifiedBy, verifiedAt: profile?.verifiedAt instanceof Date ? profile.verifiedAt.toISOString() : profile?.verifiedAt, serialNumber: profile?.serialNumber, avatarUrl: profile?.avatarHash ? getThumbnailUrl(ctx, profile.avatarHash, 120, 120) : null, backgroundUrl: profile?.backgroundHash ? getThumbnailUrl(ctx, profile.backgroundHash, 800, 200) : null, musicUrl: profile?.musicHash ? "https://fs.chatium.ru/get/" + profile.musicHash : null, musicName: profile?.musicName || null, email: isAdmin ? (user.confirmedEmail || "") : "", accountRole: user.accountRole || "User", firstName: user.firstName || "", lastName: user.lastName || "" }
    return { success: true, profile: result }
  })