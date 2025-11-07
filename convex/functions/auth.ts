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

/**
 * Verify email address with code
 */
export const verifyEmail = mutation(
  async (ctx, { email, code }: { email: string; code: string }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    if (user.isEmailVerified) {
      return { message: "Email already verified" };
    }

    if (user.emailVerificationCode !== code) {
      throw new Error("Invalid verification code");
    }

    if (user.emailVerificationExpires && user.emailVerificationExpires < Date.now()) {
      throw new Error("Verification code has expired");
    }

    // Update user as verified
    await ctx.db.patch(user._id, {
      isEmailVerified: true,
      emailVerificationCode: undefined,
      emailVerificationExpires: undefined,
      lastSeenAt: Date.now(),
    });

    return { message: "Email verified successfully" };
  }
);

/**
 * Request password reset
 */
export const requestPasswordReset = mutation(
  async (ctx, { email }: { email: string }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!user) {
      // Don't reveal if user exists
      return { message: "If an account with that email exists, we've sent a password reset link." };
    }

    // Generate reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

    // Update user with reset code
    await ctx.db.patch(user._id, {
      passwordResetCode: resetCode,
      passwordResetExpires: expiresAt,
    });

    // Send reset email
    await sendPasswordResetEmail(ctx, { email, code: resetCode, name: user.name });

    return { message: "If an account with that email exists, we've sent a password reset link." };
  }
);

/**
 * Reset password with code
 */
export const resetPassword = mutation(
  async (ctx, { email, code, newPassword }: { email: string; code: string; newPassword: string }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!user) {
      throw new Error("Invalid reset code");
    }

    if (user.passwordResetCode !== code) {
      throw new Error("Invalid reset code");
    }

    if (user.passwordResetExpires && user.passwordResetExpires < Date.now()) {
      throw new Error("Reset code has expired");
    }

    // Note: In production, use proper password hashing (e.g., bcrypt)
    // This is simplified for the starter template

    // Update user password and clear reset code
    await ctx.db.patch(user._id, {
      password: newPassword, // Simplified - should be hashed
      passwordResetCode: undefined,
      passwordResetExpires: undefined,
    });

    return { message: "Password reset successfully" };
  }
);
