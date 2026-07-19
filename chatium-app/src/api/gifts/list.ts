// @shared
import Gifts from "../../tables/gifts.table"

export const apiGiftsListRoute = app.post("/")
  .body(s => ({ category: s.string().optional() }))
  .handle(async (ctx, req) => {
    const where: any = {}
    if (req.body.category) where.category = req.body.category
    const gifts = await Gifts.findAll(ctx, { where, order: [{ price: "asc" }] })
    return { success: true, gifts: gifts.map(g => ({ id: g.id, name: g.name, emoji: g.emoji, description: g.description, price: g.price, category: g.category, isLimited: !!g.isLimited, backdropColor: g.backdropColor || "#FFD700" })) }
  })