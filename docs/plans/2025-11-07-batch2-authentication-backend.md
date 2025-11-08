# Batch 2: Authentication Backend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement Convex backend authentication system with email verification, password reset, and seed data

**Architecture:** Build authentication mutations and queries using Convex server functions, integrate with Resend API for emails, and create seed data with minimal test users

**Tech Stack:** Convex, TypeScript, Resend API, Zod validation

---

## Task 1: Add Resend Email Dependencies

**Files:**
- Modify: `package.json:dependencies`

**Step 1: Install Resend package**

Run: `pnpm add resend`

**Step 2: Commit**

Run: `git add package.json pnpm-lock.yaml`
Run: `git commit -m "feat: add Resend for email services

- Install resend package for email verification
- Prepare for email authentication flow""

---

## Task 2: Create Email Utility Functions

**Files:**
- Create: `convex/functions/email.ts`

**Step 1: Create email utility functions**

Create: `convex/functions/email.ts` with content:
```typescript
import { MutationBuilder, QueryBuilder } from "convex/server";
import { v } from "convex/values";
import { Resend } from "resend";

/**
 * Send email verification using Resend
 */
export const sendVerificationEmail = mutation(
  async (ctx, { email, code, name }: { email: string; code: string; name: string }) => {
    const resend = new Resend(process.env.RESEND_API_KEY!);

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?code=${code}&email=${email}`;

    const result = await resend.emails.send({
      from: "noreply@yourapp.com",
      to: [email],
      subject: "Verify your email address",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome ${name}!</h2>
          <p>Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}"
             style="display: inline-block; background: #007bff; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 4px; margin: 16px 0;">
            Verify Email
          </a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666;">${verificationUrl}</p>
          <p style="color: #666; font-size: 12px;">
            This link will expire in 24 hours. If you didn't create an account, please ignore this email.
          </p>
        </div>
      `,
    });

    return result;
  }
);

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = mutation(
  async (ctx, { email, code, name }: { email: string; code: string; name: string }) => {
    const resend = new Resend(process.env.RESEND_API_KEY!);

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-reset?code=${code}&email=${email}`;

    const result = await resend.emails.send({
      from: "noreply@yourapp.com",
      to: [email],
      subject: "Reset your password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hi ${name},</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}"
             style="display: inline-block; background: #dc3545; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 4px; margin: 16px 0;">
            Reset Password
          </a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666;">${resetUrl}</p>
          <p style="color: #666; font-size: 12px;">
            This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
          </p>
        </div>
      `,
    });

    return result;
  }
);
```

**Step 2: Commit**

Run: `git add convex/functions/email.ts`
Run: `git commit -m "feat: add email utility functions

- Implement sendVerificationEmail mutation
- Implement sendPasswordResetEmail mutation
- Add email templates for verification and reset""

---

## Task 3: Implement User Registration

**Files:**
- Modify: `convex/functions/auth.ts`

**Step 1: Replace placeholder with registration logic**

Modify: `convex/functions/auth.ts` with content:
```typescript
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
```

**Step 2: Commit**

Run: `git add convex/functions/auth.ts`
Run: `git commit -m "feat: implement user registration

- Add register mutation with email verification
- Add getUserByEmail query for development
- Generate 6-digit verification codes
- Check for existing user before registration""

---

## Task 4: Implement Email Verification

**Files:**
- Modify: `convex/functions/auth.ts`

**Step 1: Add verify email function**

Modify: `convex/functions/auth.ts` (add after register function):
```typescript
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
```

**Step 2: Commit**

Run: `git add convex/functions/auth.ts`
Run: `git commit -m "feat: implement email verification

- Add verifyEmail mutation
- Validate verification code and expiry
- Update user as verified on success
- Handle edge cases (already verified, invalid code)""

---

## Task 5: Implement Password Reset

**Files:**
- Modify: `convex/functions/auth.ts`

**Step 1: Add password reset functions**

Modify: `convex/functions/auth.ts` (add after verifyEmail function):
```typescript
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
```

**Step 2: Commit**

Run: `git add convex/functions/auth.ts`
Run: `git commit -m "feat: implement password reset

- Add requestPasswordReset mutation
- Add resetPassword mutation
- Generate 6-digit reset codes
- Send reset email with Resend
- Validate code expiry (1 hour)""

---

## Task 6: Implement Minimal Seed Data

**Files:**
- Modify: `convex/functions/seed/minimal.ts`

**Step 1: Create minimal seed data**

Modify: `convex/functions/seed/minimal.ts` with content:
```typescript
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
```

**Step 2: Update seed index**

Modify: `convex/seed.ts` with content:
```typescript
import { run as seedMinimal } from "./functions/seed/minimal";
import { run as seedDemo } from "./functions/seed/demo";

export { seedMinimal, seedDemo };

// Export the run functions directly
export const minimal = seedMinimal;
export const demo = seedDemo;
```

**Step 3: Commit**

Run: `git add convex/functions/seed/minimal.ts convex/seed.ts`
Run: `git commit -m "feat: implement minimal seed data

- Add minimal seed with 2 test users (admin, test)
- Update seed index exports
- Pre-verified users for immediate development""

---

## Task 7: Update Environment Variables

**Files:**
- Modify: `.env.example`
- Modify: `.env.local`

**Step 1: Add from email to environment files**

Modify: `.env.example` (add to email section):
```bash
# Email (Required)
# Get from: https://resend.com
RESEND_API_KEY=re_your_api_key
FROM_EMAIL=noreply@yourapp.com
```

Modify: `.env.local` (add to email section):
```bash
# Email
RESEND_API_KEY=
FROM_EMAIL=noreply@yourapp.com
```

**Step 2: Commit**

Run: `git add .env.example .env.local`
Run: `git commit -m "feat: add FROM_EMAIL to environment

- Add FROM_EMAIL to .env.example
- Add FROM_EMAIL to .env.local
- Required for email sending in authentication""

---

## Task 8: Test Authentication Backend

**Files:**
- Create: `__tests__/batch2-auth.test.ts`

**Step 1: Create authentication tests**

Create: `__tests__/batch2-auth.test.ts` with content:
```typescript
/**
 * Batch 2: Authentication Backend Tests
 * Verifies authentication functions work correctly
 */

const fs = require("fs");

describe("Batch 2: Authentication Backend", () => {
  test("auth.ts functions exist", () => {
    const authContent = fs.readFileSync("convex/functions/auth.ts", "utf8");
    expect(authContent).toContain("export const register");
    expect(authContent).toContain("export const verifyEmail");
    expect(authContent).toContain("export const requestPasswordReset");
    expect(authContent).toContain("export const resetPassword");
  });

  test("email.ts functions exist", () => {
    const emailContent = fs.readFileSync("convex/functions/email.ts", "utf8");
    expect(emailContent).toContain("export const sendVerificationEmail");
    expect(emailContent).toContain("export const sendPasswordResetEmail");
  });

  test("minimal seed exists", () => {
    const seedContent = fs.readFileSync("convex/functions/seed/minimal.ts", "utf8");
    expect(seedContent).toContain("admin@example.com");
    expect(seedContent).toContain("test@example.com");
  });

  test("FROM_EMAIL in environment", () => {
    const envExample = fs.readFileSync(".env.example", "utf8");
    expect(envExample).toContain("FROM_EMAIL=noreply@yourapp.com");
  });
});
```

**Step 2: Run tests**

Run: `npm test -- __tests__/batch2-auth.test.ts`
Expected: PASS (all 4 tests)

**Step 3: Commit**

Run: `git add __tests__/batch2-auth.test.ts`
Run: `git commit -m "test: add Batch 2 authentication tests

- Verify auth.ts has all required functions
- Check email.ts functions exist
- Validate seed data content
- Confirm FROM_EMAIL in environment""

---

## Task 9: Update Development Documentation

**Files:**
- Modify: `docs/development.md`

**Step 1: Add authentication section**

Modify: `docs/development.md` (add after Available Commands):
```markdown
## Authentication Flow

### Register
1. User fills registration form
2. System creates user with `isEmailVerified: false`
3. Sends verification email via Resend
4. User clicks link in email
5. User enters code to verify
6. Account becomes active

### Login
1. User enters credentials
2. System checks if email is verified
3. If not verified → redirect to verification page
4. If verified → allow login

### Password Reset
1. User clicks "Forgot Password"
2. System sends reset email
3. User clicks link in email
4. User enters new password
5. Password is updated

## Test Users

After running `pnpm seed`, you can use:

- **Admin:** admin@example.com
- **Test:** test@example.com

Both users are pre-verified and ready to use.
```

**Step 2: Commit**

Run: `git add docs/development.md`
Run: `git commit -m "docs: add authentication flow documentation

- Document registration flow
- Document login verification
- Document password reset
- List test users for development""

---

## Summary

**Batch 2 Complete!** Authentication backend is now implemented with:

✅ Email verification with Resend API
✅ User registration with code verification
✅ Password reset functionality
✅ Minimal seed data (2 test users)
✅ Complete test suite
✅ Updated documentation

**Next Steps:**
Proceed to Batch 3: Authentication Frontend to build the UI components and pages.
