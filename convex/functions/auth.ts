import { mutation, query } from "convex/server";
import { v } from "convex/values";
import { sendVerificationEmail } from "./email";

/**
 * Register a new user with email verification
 */
export const register = mutation(
  async (ctx, { email, name, password }: { email: string; name: string; password: string }) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create user
    const userId = await ctx.db.insert("users", {
      email,
      name,
      createdAt: Date.now(),
      lastSeenAt: Date.now(),
      isEmailVerified: false,
      emailVerificationCode: verificationCode,
      emailVerificationExpires: expiresAt,
      emailVerificationSentAt: Date.now(),
    });

    // Send verification email
    await sendVerificationEmail(ctx, { email, code: verificationCode, name });

    return { userId, message: "Registration successful. Please check your email to verify your account." };
  }
);

/**
 * Get user by email (for development)
 */
export const getUserByEmail = query(
  async (ctx, { email }: { email: string }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
  }
);
