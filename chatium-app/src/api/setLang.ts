// @shared
import { updateUser } from "@app/users"

export const apiSetLangRoute = app.post("/")
  .body(s => ({ lang: s.enum(["ru", "en"]) }))
  .handle(async (ctx, req) => {
    if (!ctx.user) return { success: false, error: "Не авторизован" }
    try { await updateUser(ctx, ctx.user.id, { lang: req.body.lang } as any) } catch {}
    return { success: true, lang: req.body.lang }
  })