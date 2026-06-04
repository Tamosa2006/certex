import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const placeOrder = mutation({
  args: {
    name: v.string(),
    address: v.string(),
    totalAmount: v.number(),
    paymentMethod: v.string(),
    status: v.string(),
    createdAt: v.number(),
    userId: v.optional(v.string()), // Clerk user ID
  },
  handler: async (ctx, args) => {
    const orderId = await ctx.db.insert("orders", {
      name: args.name,
      address: args.address,
      totalAmount: args.totalAmount,
      paymentMethod: args.paymentMethod,
      status: args.status,
      createdAt: args.createdAt,
      userId: args.userId,
    });
    return orderId;
  },
});

// Check how many past orders a user has placed
export const getUserOrderCount = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
    return orders.length;
  },
});