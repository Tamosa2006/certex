import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  orders: defineTable({
    name: v.string(),
    address: v.string(),
    totalAmount: v.number(),
    paymentMethod: v.string(),
    status: v.string(),
    createdAt: v.number(),
    userId: v.optional(v.string()),
  }),
  products: defineTable({
    id: v.number(),
    category: v.string(),
    price: v.number(),
    stock: v.number(),
    title: v.string(),
  }),
  wishlist: defineTable({
    userId: v.string(),
    productId: v.number(),
    title: v.string(),
    price: v.number(),
    image: v.string(),
    category: v.string(),
    addedAt: v.number(),
  }),
});