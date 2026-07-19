// @shared
import { requireAccountRole, updateAccountRole } from "@app/auth"

export const apiUsersChangeRoleRoute = app.post("/")
  .body(s => ({ userId: s.string(), newRole: s.enum(["None", "Staff", "Admin"]) }))
  .handle(async (ctx, req) => {
    requireAccountRole(ctx, "Admin")
    try {
      const updatedRole = await updateAccountRole(ctx, req.body.userId, req.body.newRole)
      return { success: true, role: updatedRole }
    } catch (e: any) { return { success: false, error: e?.message || "Ошибка при смене роли" } }
  })