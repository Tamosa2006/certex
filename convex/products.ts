import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Fetch all products with live stock
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").collect();
  },
});

// Decrement stock when item is added to cart
export const decrementStock = mutation({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    const product = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("title"), args.title))
      .first();

    if (!product) return;
    if (product.stock <= 0) throw new Error("Out of stock");

    await ctx.db.patch(product._id, { stock: product.stock - 1 });
  },
});

// Increment stock when item is removed from cart
export const incrementStock = mutation({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    const product = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("title"), args.title))
      .first();

    if (!product) return;
    await ctx.db.patch(product._id, { stock: product.stock + 1 });
  },
});