import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all wishlist items for a user
export const getWishlist = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("wishlist")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();
  },
});

// Add item to wishlist
export const addToWishlist = mutation({
  args: {
    userId: v.string(),
    productId: v.number(),
    title: v.string(),
    price: v.number(),
    image: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    // Prevent duplicates
    const existing = await ctx.db
      .query("wishlist")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("productId"), args.productId)
        )
      )
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("wishlist", {
      userId: args.userId,
      productId: args.productId,
      title: args.title,
      price: args.price,
      image: args.image,
      category: args.category,
      addedAt: Date.now(),
    });
  },
});

// Remove item from wishlist
export const removeFromWishlist = mutation({
  args: { userId: v.string(), productId: v.number() },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("wishlist")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("productId"), args.productId)
        )
      )
      .first();

    if (item) await ctx.db.delete(item._id);
  },
});