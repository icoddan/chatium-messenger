// @shared
import { sendDataToSocket } from "@app/socket"
import { isUserBlocked } from "../users/checkBlocked"

export const apiCallsSignalRoute = app.post("/")
  .body(s => ({ action: s.enum(["call", "accept", "reject", "end", "ice-candidate", "sdp-offer", "sdp-answer"]), partnerUserId: s.string(), sdp: s.string().optional(), iceCandidate: s.string().optional(), callType: s.enum(["audio", "video"]).optional() }))
  .handle(async (ctx, req) => {
    if (!ctx.user?.id) return { success: false, error: "Не авторизован" }
    if ((await isUserBlocked(ctx, ctx.user.id)).blocked) return { success: false, error: "Вы заблокированы" }
    const { action, partnerUserId, sdp, iceCandidate, callType } = req.body
    const sorted = [ctx.user.id, partnerUserId].sort(); const socketId = "dialog_" + sorted[0] + "_" + sorted[1]
    if (action === "call") await sendDataToSocket(ctx, socketId, { type: "call-incoming", data: { fromUserId: ctx.user.id, fromName: ctx.user?.displayName || "Пользователь", callType: callType || "audio", time: new Date().toISOString() } })
    else if (action === "accept") await sendDataToSocket(ctx, socketId, { type: "call-accepted", data: { fromUserId: ctx.user.id, time: new Date().toISOString() } })
    else if (action === "reject") await sendDataToSocket(ctx, socketId, { type: "call-rejected", data: { fromUserId: ctx.user.id, time: new Date().toISOString() } })
    else if (action === "end") await sendDataToSocket(ctx, socketId, { type: "call-ended", data: { fromUserId: ctx.user.id, time: new Date().toISOString() } })
    else if (action === "sdp-offer") await sendDataToSocket(ctx, socketId, { type: "call-sdp", data: { fromUserId: ctx.user.id, sdp, type: "offer" } })
    else if (action === "sdp-answer") await sendDataToSocket(ctx, socketId, { type: "call-sdp", data: { fromUserId: ctx.user.id, sdp, type: "answer" } })
    else if (action === "ice-candidate") await sendDataToSocket(ctx, socketId, { type: "call-ice", data: { fromUserId: ctx.user.id, iceCandidate } })
    return { success: true }
  })