import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    image: v.optional(v.string()),
    createdAt: v.number(),
    lastSeenAt: v.number(),
    lastLoginAt: v.optional(v.number()),
    emailVerificationCode: v.optional(v.string()),
    emailVerificationExpires: v.optional(v.number()),
    isEmailVerified: v.boolean(),
    emailVerificationSentAt: v.optional(v.number()),
    passwordResetCode: v.optional(v.string()),
    passwordResetExpires: v.optional(v.number())
  }).index("by_email", ["email"]),
});
