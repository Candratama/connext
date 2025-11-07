import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

/**
 * Register a new user with email verification
 */
export const register = mutationGeneric({
  args: {
    email: v.string(),
    name: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { email, name, password }) => {
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

    // TODO: Send verification email in production
    console.log(`Verification code for ${email}: ${verificationCode}`);

    return { userId, message: "Registration successful. Please check your email to verify your account." };
  },
});

/**
 * Get user by email (for development)
 */
export const getUserByEmail = queryGeneric({
  args: {
    email: v.string(),
  },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
  },
});

/**
 * Verify email address with code
 */
export const verifyEmail = mutationGeneric({
  args: {
    email: v.string(),
    code: v.string(),
  },
  handler: async (ctx, { email, code }) => {
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
  },
});

/**
 * Request password reset
 */
export const requestPasswordReset = mutationGeneric({
  args: {
    email: v.string(),
  },
  handler: async (ctx, { email }) => {
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

    // TODO: Send reset email in production
    console.log(`Password reset code for ${email}: ${resetCode}`);

    return { message: "If an account with that email exists, we've sent a password reset link." };
  },
});

/**
 * Reset password with code
 */
export const resetPassword = mutationGeneric({
  args: {
    email: v.string(),
    code: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, { email, code, newPassword }) => {
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
  },
});
