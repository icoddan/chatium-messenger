import { createRealUser, normalizeIdentityKey, findIdentities } from "@app/auth"
import { sendNotificationToAccountOwners } from "@user-notifier/sdk"
import { captureCustomerEvent } from "@crm/sdk"
import Profiles from "../../tables/profiles.table"

export const apiAuthRegisterRoute = app.post("/")
  .body(s => ({ email: s.string(), password: s.string(), name: s.string() }))
  .handle(async (ctx, req) => {
    const { email, password, name } = req.body
    const existing = await findIdentities(ctx, { where: { type: "Email", key: normalizeIdentityKey("Email", email) } })
    if (existing.length > 0) return { success: false, error: "Этот email уже зарегистрирован" }
    const user = await createRealUser(ctx, { firstName: name, unconfirmedIdentities: { Email: normalizeIdentityKey("Email", email) } })
    await user.updatePassword(ctx, password)
    const allProfiles = await Profiles.findAll(ctx, { limit: 1000 })
    const maxSerial = allProfiles.reduce((max, p) => Math.max(max, (p as any).serialNumber || 0), 0)
    await Profiles.create(ctx, { userId: user.id, displayName: name, username: "user_" + user.id.slice(-8), serialNumber: maxSerial + 1, bio: "", isVerified: false })
    await sendNotificationToAccountOwners(ctx, { title: "Новая регистрация", html: "<b>" + name + "</b> - " + email, plain: name + " - " + email, md: "**" + name + "** - " + email })
    await captureCustomerEvent(ctx, { event: "user_registered", name: "Новая регистрация", contacts: [{ type: "email", value: email }], customer: { displayName: name } })
    return { success: true, message: "Регистрация успешна! Теперь вы можете войти." }
  })