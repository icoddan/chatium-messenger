// @shared
import Profiles from "../../tables/profiles.table"

export const apiUsersChangeSerialNumberRoute = app.post("/")
  .body(s => ({ userId: s.string(), serialNumber: s.number() }))
  .handle(async (ctx, req) => {
    if (ctx.user?.accountRole !== "Owner") throw new Error("Только владелец может изменять ID пользователей")
    const { userId, serialNumber } = req.body
    if (serialNumber < 0 || !Number.isInteger(serialNumber)) return { success: false, error: "ID должен быть целым положительным числом" }
    const [profile] = await Profiles.findAll(ctx, { where: { userId }, limit: 1 })
    if (!profile) return { success: false, error: "Профиль пользователя не найден" }
    await Profiles.update(ctx, { id: profile.id, serialNumber })
    return { success: true, serialNumber }
  })