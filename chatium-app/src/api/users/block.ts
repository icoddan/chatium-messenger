// @shared
import { requireAccountRole } from "@app/auth"
import BlockedUsers from "../../tables/blocked_users.table"

export const apiUsersBlockRoute = app.post("/")
  .body(s => ({ userId: s.string(), action: s.enum(["block", "unblock"]), reason: s.string().optional(), duration: s.string().optional() }))
  .handle(async (ctx, req) => {
    requireAccountRole(ctx, "Admin")
    const { userId, action, reason, duration } = req.body
    if (action === "block") {
      if ((await BlockedUsers.findAll(ctx, { where: { userId, isActive: true } })).length > 0) return { success: false, error: "Пользователь уже заблокирован" }
      let isPermanent = false, blockedUntil = null
      switch (duration) {
        case "permanent": isPermanent = true; break
        case "1h": blockedUntil = new Date(Date.now() + 3600000); break
        case "6h": blockedUntil = new Date(Date.now() + 6*3600000); break
        case "24h": blockedUntil = new Date(Date.now() + 24*3600000); break
        case "3d": blockedUntil = new Date(Date.now() + 3*86400000); break
        case "7d": blockedUntil = new Date(Date.now() + 7*86400000); break
        case "30d": blockedUntil = new Date(Date.now() + 30*86400000); break
        default: isPermanent = true
      }
      await BlockedUsers.create(ctx, { userId, reason: reason || "Причина не указана", blockedBy: ctx.user!.id, blockedAt: new Date(), blockedUntil, isPermanent, isActive: true })
      return { success: true, message: isPermanent ? "Пользователь заблокирован навсегда" : "Пользователь заблокирован" }
    } else {
      const blocks = await BlockedUsers.findAll(ctx, { where: { userId, isActive: true } })
      for (const b of blocks) await BlockedUsers.update(ctx, { id: b.id, isActive: false })
      return { success: true, message: "Пользователь разблокирован" }
    }
  })