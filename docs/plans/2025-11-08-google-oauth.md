# Google OAuth Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement Google OAuth authentication for the Connext Admin Template, allowing users to sign in with their Google accounts alongside the existing email/password system.

**Architecture:**
- Convex backend: Create `googleAuth` mutation to handle OAuth token exchange
- Frontend: Add Google login button and handle OAuth flow with Google Identity Services
- Integration: Extend existing user schema to support OAuth providers
- Security: Validate OAuth tokens server-side in Convex

**Tech Stack:** Google Identity Services, Convex mutations, Next.js 16, react-hook-form, existing auth context

---

## Prerequisites

**Required Google Cloud Setup (User must do):**
1. Create Google Cloud project at https://console.cloud.google.com/
2. Enable Google+ API
3. Create OAuth 2.0 Client ID (Web application)
4. Add authorized origins: `http://localhost:3000` (dev) and production domain
5. Add authorized redirect URIs: `http://localhost:3000/auth/google/callback` (dev)
6. Copy Client ID and Client Secret

---

## Tasks

### Task 1: Update Environment Configuration

**Files:**
- Modify: `.env.example:20-30`
- Modify: `.env.local:20-30` (if exists)

**Step 1: Add Google OAuth environment variables**

Update `.env.example` to include:
```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

**Step 2: Update README documentation**

**Step 3: Commit**

```bash
git add .env.example README.md
git commit -m "docs: add Google OAuth environment variables to .env.example"
```

---

### Task 2: Extend User Schema for OAuth

**Files:**
- Modify: `convex/schema.ts:40-80`

**Step 1: Add OAuth fields to user schema**

Find the `users` schema definition and add after passwordHash field:
```typescript
users: defineTable({
  email: v.string(),
  name: v.string(),
  passwordHash: v.optional(v.string()),
  emailVerified: v.boolean(),
  image: v.optional(v.string()),
  // OAuth fields
  googleId: v.optional(v.string()),
  provider: v.union(v.literal("email"), v.literal("google")),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("email", ["email"]).index("googleId", ["googleId"]);
```

**Step 2: Update users table index**

**Step 3: Commit**

```bash
git add convex/schema.ts
git commit -m "feat: extend user schema with OAuth provider support"
```

---

### Task 3: Create Google OAuth Convex Functions

**Files:**
- Create: `convex/functions/auth:googleAuth.ts`

**Step 1: Write the mutation implementation**

```typescript
import { mutation } from "./_generated/server";
import { google } from "convex/server";
import { v } from "convex/values";

export const googleAuth = mutation({
  args: {
    credential: v.string(), // Google credential token from frontend
  },
  handler: async (ctx, args) => {
    // Import required modules
    const { default: fetch } = await import("fetch");

    // Exchange code for access token with Google
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code: args.credential,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange Google code");
    }

    const tokens = await tokenResponse.json();

    // Get user info from Google
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }
    );

    if (!userInfoResponse.ok) {
      throw new Error("Failed to get Google user info");
    }

    const googleUser = await userInfoResponse.json();

    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), googleUser.email))
      .unique();

    if (existingUser) {
      // Update existing user with Google info
      await ctx.db.patch(existingUser._id, {
        googleId: googleUser.id,
        provider: "google",
        image: googleUser.picture,
        name: googleUser.name,
        updatedAt: Date.now(),
      });
      return { user: existingUser, isNewUser: false };
    }

    // Create new user
    const newUser = await ctx.db.insert("users", {
      email: googleUser.email,
      name: googleUser.name,
      emailVerified: true, // Google verifies emails
      image: googleUser.picture,
      googleId: googleUser.id,
      provider: "google",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { user: newUser, isNewUser: true };
  },
});
```

**Step 2: Verify no syntax errors**

**Step 3: Commit**

```bash
git add convex/functions/auth.ts
git commit -m "feat: add Google OAuth mutation to auth.ts"
```

---

### Task 4: Add Google Login Button Component

**Files:**
- Create: `src/components/auth/google-login-button.tsx`

**Step 1: Write Google login button component**

```typescript
"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

interface GoogleLoginButtonProps {
  onSuccess: (user: any) => void;
  onError: (error: string) => void;
}

export function GoogleLoginButton({ onSuccess, onError }: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);

      // Load Google Identity Services
      if (!window.google) {
        await loadGoogleScript();
      }

      // Get the token
      const token = await new Promise<string>((resolve, reject) => {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: (response: any) => {
            resolve(response.credential);
          },
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-button"),
          {
            theme: "outline",
            size: "large",
            width: "100%",
          }
        );
      });

      // Send token to Convex
      const result = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: token }),
      });

      if (!result.ok) {
        throw new Error("Authentication failed");
      }

      const data = await result.json();
      onSuccess(data.user);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const loadGoogleScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Google script"));
      document.body.appendChild(script);
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? "Signing in..." : "Continue with Google"}
    </Button>
  );
}
```

**Step 2: Add type declarations**

Create or update `src/types/google.d.ts`:
```typescript
declare global {
  interface Window {
    google: any;
  }
}

export {};
```

**Step 3: Commit**

```bash
git add src/components/auth/google-login-button.tsx src/types/google.d.ts
git commit -feat: add Google login button component"
```

---

### Task 5: Create API Route for Google OAuth

**Files:**
- Create: `src/app/api/auth/google/route.ts`

**Step 1: Write the API route handler**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/convexClient";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json();

    // Call Convex mutation
    const result = await api.auth.googleAuth({ credential });

    // Set session cookie
    cookies().set("session", JSON.stringify(result.user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/auth/google/route.ts
git commit -m "feat: add Google OAuth API route"
```

---

### Task 6: Update Login Form with Google OAuth

**Files:**
- Modify: `src/components/auth/login-form.tsx:60-90`

**Step 1: Add Google login to login form**

Find the `LoginForm` component and add after the password field:

```typescript
import { GoogleLoginButton } from "./google-login-button";
import { useAuth } from "@/contexts/auth-context";

export function LoginForm() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSuccess = (user: any) => {
    login(user);
    router.push("/dashboard");
  };

  const handleGoogleError = (error: string) => {
    setError(error);
  };

  return (
    <div className="space-y-4">
      {/* Existing email/password form */}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <GoogleLoginButton
        onSuccess={handleGoogleSuccess}
        onError={setError}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/auth/login-form.tsx
git commit -m "feat: add Google OAuth to login form"
```

---

### Task 7: Update Register Form with Google OAuth

**Files:**
- Modify: `src/components/auth/register-form.tsx:60-90`

**Step 1: Add Google login to register form**

Similar to login form, add GoogleLoginButton component to the register form.

**Step 2: Commit**

```bash
git add src/components/auth/register-form.tsx
git commit -m "feat: add Google OAuth to register form"
```

---

### Task 8: Update Environment Setup Scripts

**Files:**
- Modify: `scripts/setup.sh:45-55`
- Modify: `scripts/setup-interactive.ts:30-50`

**Step 1: Add Google OAuth to setup scripts**

Update both setup scripts to prompt for Google Client ID and Secret.

**Step 2: Commit**

```bash
git add scripts/setup.sh scripts/setup-interactive.ts
git commit -m "feat: add Google OAuth to interactive setup"
```

---

### Task 9: Add Google OAuth Documentation

**Files:**
- Modify: `README.md:80-120`

**Step 1: Add Google OAuth section to README**

Add a new section under "Required Accounts" and "Getting Started".

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add Google OAuth setup instructions"
```

---

### Task 10: Create Test Suite for Google OAuth

**Files:**
- Create: `__tests__/google-oauth.test.ts`

**Step 1: Write comprehensive tests**

```typescript
import { api } from "../src/lib/convexClient";

// Mock fetch for Google API calls
global.fetch = jest.fn();

describe("Google OAuth", () => {
  test("should authenticate with valid Google token", async () => {
    // Mock Google API responses
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ access_token: "test_token" }),
    });
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: "google_123",
        email: "test@example.com",
        name: "Test User",
        picture: "https://example.com/avatar.jpg",
      }),
    });

    // Test the mutation
    const result = await api.auth.googleAuth({ credential: "test_credential" });

    expect(result.user.email).toBe("test@example.com");
    expect(result.user.provider).toBe("google");
    expect(result.isNewUser).toBe(true);
  });

  test("should link existing email user to Google", async () => {
    // Test linking existing user
    // ...
  });
});
```

**Step 2: Run tests**

```bash
pnpm test __tests__/google-oauth.test.ts
```

**Step 3: Commit**

```bash
git add __tests__/google-oauth.test.ts
git commit -m "test: add Google OAuth test suite"
```

---

### Task 11: Create Migration Script for Existing Users

**Files:**
- Create: `convex/functions/users:addGoogleFields.ts`

**Step 1: Write migration mutation**

```typescript
export const addGoogleFields = mutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    for (const user of users) {
      if (!user.provider) {
        await ctx.db.patch(user._id, {
          provider: "email",
          updatedAt: Date.now(),
        });
      }
    }
  },
});
```

**Step 2: Commit**

```bash
git add convex/functions/users.ts
git commit -m "feat: add migration script for provider field"
```

---

### Task 12: Update Landing Page

**Files:**
- Modify: `src/app/page.tsx:190-210`

**Step 1: Add Google OAuth to features section**

Update the Features section to mention Google OAuth support.

**Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "docs: mention Google OAuth in landing page"
```

---

## Testing Checklist

After implementation, verify:
- [ ] Google login button appears on login/register pages
- [ ] Clicking "Continue with Google" opens Google popup
- [ ] Valid Google users can authenticate
- [ ] New users are created correctly
- [ ] Existing users are linked to their Google account
- [ ] Session is created after successful Google login
- [ ] User is redirected to dashboard after login
- [ ] Logout works for Google users
- [ ] Tests pass: `pnpm test`

---

## Deployment Notes

**Production Checklist:**
- [ ] Set GOOGLE_CLIENT_ID in production env
- [ ] Set GOOGLE_CLIENT_SECRET in production env
- [ ] Update Google Console with production domain
- [ ] Test Google OAuth in production
- [ ] Verify all tests pass in production
- [ ] Update README with production setup steps

---

**Plan complete and saved to `docs/plans/2025-11-08-google-oauth.md`.**

**Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
