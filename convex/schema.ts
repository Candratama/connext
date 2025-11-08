import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    password: v.optional(v.string()), // Hashed password (optional for OAuth-only users)
    image: v.optional(v.string()),
    createdAt: v.number(),
    lastSeenAt: v.number(),
    lastLoginAt: v.optional(v.number()),
    emailVerificationCode: v.optional(v.string()),
    emailVerificationExpires: v.optional(v.number()),
    isEmailVerified: v.boolean(),
    emailVerificationSentAt: v.optional(v.number()),
    passwordResetCode: v.optional(v.string()),
    passwordResetExpires: v.optional(v.number()),
    // OAuth fields
    googleId: v.optional(v.string()),
    provider: v.union(v.literal("email"), v.literal("google")),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_googleId", ["googleId"]),
});
