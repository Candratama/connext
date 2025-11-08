import { mutationGeneric, queryGeneric, actionGeneric, internalMutationGeneric } from "convex/server";
import { v } from "convex/values";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email";
import { api, internal } from "../_generated/api";
import bcrypt from "bcryptjs";

// Layer 2: Business Logic Validation - Validate input at backend layer
function validateEmail(email: string): string {
  if (!email || typeof email !== "string") {
    throw new Error("Email is required");
  }
  const trimmed = email.trim();
  if (trimmed.length === 0) {
    throw new Error("Email is required");
  }
  if (trimmed.length > 254) {
    throw new Error("Email must be less than 254 characters");
  }
  if (trimmed.includes('\x00')) {
    throw new Error("Invalid characters in email");
  }
  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    throw new Error("Invalid email address");
  }
  return trimmed;
}

function validatePassword(password: string): string {
  if (!password || typeof password !== "string") {
    throw new Error("Password is required");
  }
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
  if (password.length > 128) {
    throw new Error("Password must be less than 128 characters");
  }
  if (password.includes('\x00')) {
    throw new Error("Invalid characters in password");
  }
  return password;
}

function validateName(name: string): string {
  if (!name || typeof name !== "string") {
    throw new Error("Name is required");
  }
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    throw new Error("Name is required");
  }
  if (trimmed.length > 100) {
    throw new Error("Name must be less than 100 characters");
  }
  if (trimmed.includes('\x00')) {
    throw new Error("Invalid characters in name");
  }
  return trimmed;
}

function validateCode(code: string): string {
  if (!code || typeof code !== "string") {
    throw new Error("Code is required");
  }
  const trimmed = code.trim();
  if (trimmed.length === 0) {
    throw new Error("Code is required");
  }
  if (trimmed.length > 10) {
    throw new Error("Invalid code");
  }
  if (trimmed.includes('\x00')) {
    throw new Error("Invalid characters in code");
  }
  return trimmed;
}

/**
 * Internal mutation: Create user in database
 */
export const createUserInternal = internalMutationGeneric({
  args: {
    email: v.string(),
    name: v.string(),
    password: v.string(),
    verificationCode: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, { email, name, password, verificationCode, expiresAt }) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Create user
    const userId = await ctx.db.insert("users", {
      email,
      name,
      password, // Already hashed with bcrypt in the action
      createdAt: Date.now(),
      lastSeenAt: Date.now(),
      isEmailVerified: false,
      emailVerificationCode: verificationCode,
      emailVerificationExpires: expiresAt,
      emailVerificationSentAt: Date.now(),
    });

    return userId;
  },
});

/**
 * Register a new user with email verification (ACTION)
 */
export const register = actionGeneric({
  args: {
    email: v.string(),
    name: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { email, name, password }): Promise<{ userId: any; message: string }> => {
    // Layer 2: Business Logic Validation - Validate input before processing
    const validatedEmail = validateEmail(email);
    const validatedName = validateName(name);
    const validatedPassword = validatePassword(password);

    // Hash password with bcrypt (10 salt rounds)
    const hashedPassword = await bcrypt.hash(validatedPassword, 10);

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create user in database
    const userId: any = await ctx.runMutation(internal.functions.auth.createUserInternal, {
      email: validatedEmail,
      name: validatedName,
      password: hashedPassword,
      verificationCode,
      expiresAt,
    });

    // Send verification email (external API call - only works in actions!)
    await sendVerificationEmail({
      email: validatedEmail,
      code: verificationCode,
      name: validatedName,
      apiKey: process.env.RESEND_API_KEY!,
      fromEmail: process.env.FROM_EMAIL!,
      appUrl: process.env.NEXT_PUBLIC_APP_URL!,
    });

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
 * Internal mutation: Update user with new verification code
 */
export const updateVerificationCodeInternal = internalMutationGeneric({
  args: {
    email: v.string(),
    verificationCode: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, { email, verificationCode, expiresAt }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!user) {
      return { found: false, name: null };
    }

    if (user.isEmailVerified) {
      return { found: true, name: user.name, alreadyVerified: true };
    }

    // Update user with new code
    await ctx.db.patch(user._id, {
      emailVerificationCode: verificationCode,
      emailVerificationExpires: expiresAt,
      emailVerificationSentAt: Date.now(),
    });

    return { found: true, name: user.name, alreadyVerified: false };
  },
});

/**
 * Resend verification email (ACTION)
 */
export const resendVerification = actionGeneric({
  args: {
    email: v.string(),
  },
  handler: async (ctx, { email }) => {
    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Update user in database
    const result = await ctx.runMutation(internal.functions.auth.updateVerificationCodeInternal, {
      email,
      verificationCode,
      expiresAt,
    });

    if (!result.found) {
      return { message: "If an account with that email exists, we've sent a verification email." };
    }

    if (result.alreadyVerified) {
      return { message: "Email is already verified" };
    }

    // Send verification email (external API call - only works in actions!)
    await sendVerificationEmail({
      email,
      code: verificationCode,
      name: result.name!,
      apiKey: process.env.RESEND_API_KEY!,
      fromEmail: process.env.FROM_EMAIL!,
      appUrl: process.env.NEXT_PUBLIC_APP_URL!,
    });

    return { message: "If an account with that email exists, we've sent a verification email." };
  },
});

/**
 * Internal mutation: Set password reset code
 */
export const setPasswordResetCodeInternal = internalMutationGeneric({
  args: {
    email: v.string(),
    resetCode: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, { email, resetCode, expiresAt }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!user) {
      return { found: false, name: null };
    }

    // Update user with reset code
    await ctx.db.patch(user._id, {
      passwordResetCode: resetCode,
      passwordResetExpires: expiresAt,
    });

    return { found: true, name: user.name };
  },
});

/**
 * Request password reset (ACTION)
 */
export const requestPasswordReset = actionGeneric({
  args: {
    email: v.string(),
  },
  handler: async (ctx, { email }) => {
    // Generate reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

    // Update user in database
    const result = await ctx.runMutation(internal.functions.auth.setPasswordResetCodeInternal, {
      email,
      resetCode,
      expiresAt,
    });

    if (!result.found) {
      // Don't reveal if user exists
      return { message: "If an account with that email exists, we've sent a password reset link." };
    }

    // Send password reset email (external API call - only works in actions!)
    await sendPasswordResetEmail({
      email,
      code: resetCode,
      name: result.name!,
      apiKey: process.env.RESEND_API_KEY!,
      fromEmail: process.env.FROM_EMAIL!,
      appUrl: process.env.NEXT_PUBLIC_APP_URL!,
    });

    return { message: "If an account with that email exists, we've sent a password reset link." };
  },
});

/**
 * Internal mutation: Update password after reset
 */
export const updatePasswordInternal = internalMutationGeneric({
  args: {
    userId: v.id("users"),
    hashedPassword: v.string(),
  },
  handler: async (ctx, { userId, hashedPassword }) => {
    await ctx.db.patch(userId, {
      password: hashedPassword,
      passwordResetCode: undefined,
      passwordResetExpires: undefined,
    });
  },
});

/**
 * Reset password with code (ACTION)
 */
export const resetPassword = actionGeneric({
  args: {
    email: v.string(),
    code: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, { email, code, newPassword }) => {
    // Get user
    const user = await ctx.runQuery(api.functions.auth.getUserWithPassword, { email });

    if (!user) {
      return {
        success: false,
        error: "INVALID_RESET_CODE",
        message: "Invalid reset code",
      };
    }

    if (user.passwordResetCode !== code) {
      return {
        success: false,
        error: "INVALID_RESET_CODE",
        message: "Invalid reset code",
      };
    }

    if (user.passwordResetExpires && user.passwordResetExpires < Date.now()) {
      return {
        success: false,
        error: "CODE_EXPIRED",
        message: "Reset code has expired",
      };
    }

    // Hash new password with bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset code
    await ctx.runMutation(internal.functions.auth.updatePasswordInternal, {
      userId: user._id,
      hashedPassword,
    });

    return {
      success: true,
      message: "Password reset successfully",
    };
  },
});

/**
 * Internal query: Get user by email with password
 */
export const getUserWithPassword = queryGeneric({
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
 * Internal mutation: Update last seen after login
 */
export const updateLastSeenInternal = internalMutationGeneric({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    await ctx.db.patch(userId, {
      lastSeenAt: Date.now(),
    });
  },
});

/**
 * Login with email and password (ACTION)
 */
export const login = actionGeneric({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { email, password }): Promise<{
    success: boolean;
    error?: string;
    message?: string;
    user?: {
      _id: any;
      email: string;
      name: string;
      image?: string;
      isEmailVerified: boolean;
    };
  }> => {
    // Layer 2: Business Logic Validation - Validate input before processing
    const validatedEmail = validateEmail(email);
    const validatedPassword = validatePassword(password);

    // Get user with password
    const user: any = await ctx.runQuery(api.functions.auth.getUserWithPassword, { email: validatedEmail });

    if (!user) {
      return {
        success: false,
        error: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      };
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return {
        success: false,
        error: "EMAIL_NOT_VERIFIED",
        message: "Please verify your email address before logging in.",
      };
    }

    // Verify password with bcrypt
    if (!user.password) {
      return {
        success: false,
        error: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      };
    }

    const passwordMatch = await bcrypt.compare(validatedPassword, user.password);
    if (!passwordMatch) {
      return {
        success: false,
        error: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      };
    }

    // Update last seen
    await ctx.runMutation(internal.functions.auth.updateLastSeenInternal, {
      userId: user._id,
    });

    // Return user data (excluding sensitive fields)
    return {
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        image: user.image,
        isEmailVerified: user.isEmailVerified,
      },
    };
  },
});

/**
 * Google OAuth authentication (ACTION)
 * Exchanges Google credential for user info and creates/updates user
 */
export const googleAuth = actionGeneric({
  args: {
    credential: v.string(),
  },
  handler: async (ctx, { credential }): Promise<{
    success: boolean;
    user?: {
      _id: any;
      email: string;
      name: string;
      image?: string;
      isEmailVerified: boolean;
      provider: string;
    };
    isNewUser?: boolean;
    error?: string;
  }> => {
    // Layer 2: Business Logic Validation
    if (!credential || typeof credential !== "string") {
      return {
        success: false,
        error: "INVALID_CREDENTIAL",
        message: "Google credential is required",
      };
    }

    try {
      // Verify the Google ID token with Google
      const googleVerifyUrl = `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${credential}`;
      const response = await fetch(googleVerifyUrl);

      if (!response.ok) {
        return {
          success: false,
          error: "INVALID_GOOGLE_TOKEN",
          message: "Invalid Google credential",
        };
      }

      const googleUser = await response.json();

      // Validate Google user data
      if (!googleUser.email || !googleUser.sub) {
        return {
          success: false,
          error: "INVALID_GOOGLE_USER",
          message: "Invalid Google user data",
        };
      }

      // Check if user already exists
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", googleUser.email))
        .unique();

      if (existingUser) {
        // Update existing user with Google info
        await ctx.db.patch(existingUser._id, {
          googleId: googleUser.sub,
          provider: "google",
          image: googleUser.picture,
          name: googleUser.name,
          isEmailVerified: true, // Google verifies emails
          updatedAt: Date.now(),
          lastSeenAt: Date.now(),
        });

        return {
          success: true,
          user: {
            _id: existingUser._id,
            email: googleUser.email,
            name: googleUser.name,
            image: googleUser.picture,
            isEmailVerified: true,
            provider: "google",
          },
          isNewUser: false,
        };
      }

      // Create new user
      const newUserId = await ctx.db.insert("users", {
        email: googleUser.email,
        name: googleUser.name || googleUser.email.split("@")[0],
        image: googleUser.picture,
        createdAt: Date.now(),
        lastSeenAt: Date.now(),
        isEmailVerified: true, // Google verifies emails
        googleId: googleUser.sub,
        provider: "google",
        updatedAt: Date.now(),
      });

      return {
        success: true,
        user: {
          _id: newUserId,
          email: googleUser.email,
          name: googleUser.name || googleUser.email.split("@")[0],
          image: googleUser.picture,
          isEmailVerified: true,
          provider: "google",
        },
        isNewUser: true,
      };
    } catch (error) {
      return {
        success: false,
        error: "GOOGLE_AUTH_ERROR",
        message: "Failed to authenticate with Google",
      };
    }
  },
});
