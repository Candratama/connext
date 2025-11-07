import { Mutation } from "convex/server";
import { v } from "convex/values";

/**
 * Seed database with minimal test data
 * Creates 2 test users ready for development
 */
export const run: Mutation = async (ctx) => {
  // Create admin user
  const adminEmail = "admin@example.com";
  const existingAdmin = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", adminEmail))
    .unique();

  if (!existingAdmin) {
    await ctx.db.insert("users", {
      email: adminEmail,
      name: "Admin User",
      createdAt: Date.now(),
      lastSeenAt: Date.now(),
      isEmailVerified: true,
    });
  }

  // Create test user
  const testEmail = "test@example.com";
  const existingTest = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", testEmail))
    .unique();

  if (!existingTest) {
    await ctx.db.insert("users", {
      email: testEmail,
      name: "Test User",
      createdAt: Date.now(),
      lastSeenAt: Date.now(),
      isEmailVerified: true,
    });
  }

  return {
    message: "Minimal seed data created",
    users: [
      { email: adminEmail, role: "admin" },
      { email: testEmail, role: "test" },
    ],
  };
};
