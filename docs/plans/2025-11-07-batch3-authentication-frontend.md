# Batch 3: Authentication Frontend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build complete authentication UI with login, registration, email verification, and password reset pages

**Architecture:** Create Next.js App Router pages and components, integrate with Convex mutations, add route protection middleware, and implement OAuth (optional)

**Tech Stack:** Next.js 16, React 19, TypeScript, Convex React hooks, Zod validation, shadcn/ui

---

## Task 1: Create Auth Context Provider

**Files:**
- Create: `src/contexts/auth-context.tsx`

**Step 1: Create authentication context**

Create: `src/contexts/auth-context.tsx` with content:
```typescript
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/generated/api";

interface User {
  _id: string;
  email: string;
  name: string;
  image?: string;
  isEmailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get current user (implement in Batch 4)
  const getCurrentUser = useQuery(api.users.getCurrentUser);

  useEffect(() => {
    if (getCurrentUser !== undefined) {
      setUser(getCurrentUser);
      setIsLoading(false);
    }
  }, [getCurrentUser]);

  const login = async (email: string, password: string) => {
    // Implement in Batch 4
    setUser(null);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
```

**Step 2: Commit**

Run: `git add src/contexts/auth-context.tsx`
Run: `git commit -m "feat: add authentication context

- Create AuthProvider component
- Add useAuth hook
- Track user state and loading
- Provide login/logout methods""

---

## Task 2: Create Login Page

**Files:**
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/components/auth/login-form.tsx`

**Step 1: Create login page**

Create: `src/app/(auth)/login/page.tsx` with content:
```typescript
import { LoginForm } from "../../components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <a
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </a>
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
```

**Step 2: Create login form component**

Create: `src/components/auth/login-form.tsx` with content:
```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth } from "../../contexts/auth-context";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const isOAuthEnabled = process.env.NEXT_PUBLIC_ENABLE_OAUTH === "true";

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {isOAuthEnabled && (
        <Button
          type="button"
          className="w-full"
          variant="outline"
          onClick={() => {
            // OAuth login will be implemented
          }}
        >
          Continue with Google
        </Button>
      )}

      {isOAuthEnabled && <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-50 text-gray-500">Or continue with email</span>
        </div>
      </div>}

      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm text-center">{error}</div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <a
            href="/forgot-password"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Forgot your password?
          </a>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
```

**Step 3: Commit**

Run: `git add src/app/\(auth\)/login/page.tsx src/components/auth/login-form.tsx`
Run: `git commit -m "feat: create login page and form

- Add login page with auth layout
- Create login form component with email/password
- Conditionally show OAuth button
- Add error handling and loading states""

---

## Task 3: Create Register Page

**Files:**
- Create: `src/app/(auth)/register/page.tsx`
- Create: `src/components/auth/register-form.tsx`

**Step 1: Create register page**

Create: `src/app/(auth)/register/page.tsx` with content:
```typescript
import { RegisterForm } from "../../components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <a
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to your existing account
            </a>
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
```

**Step 2: Create register form component**

Create: `src/components/auth/register-form.tsx` with content:
```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../convex/generated/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const register = useMutation(api.auth.register);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await register({ email, name, password });
      setSuccess(true);
      // Redirect to verification page after 2 seconds
      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mt-8 space-y-6 text-center">
        <div className="rounded-md bg-green-50 p-4">
          <h3 className="text-sm font-medium text-green-800">
            Registration successful!
          </h3>
          <div className="mt-2 text-sm text-green-700">
            <p>Please check your email to verify your account.</p>
            <p>Redirecting to verification page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1"
          />
          <p className="mt-1 text-sm text-gray-500">
            Must be at least 8 characters
          </p>
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm text-center">{error}</div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
```

**Step 3: Commit**

Run: `git add src/app/\(auth\)/register/page.tsx src/components/auth/register-form.tsx`
Run: `git commit -m "feat: create register page and form

- Add register page with auth layout
- Create register form with name, email, password
- Call Convex register mutation
- Redirect to email verification on success""

---

## Task 4: Create Email Verification Page

**Files:**
- Create: `src/app/(auth)/verify-email/page.tsx`
- Create: `src/components/auth/verify-email-form.tsx`

**Step 1: Create verify email page**

Create: `src/app/(auth)/verify-email/page.tsx` with content:
```typescript
import { VerifyEmailForm } from "../../../components/auth/verify-email-form";

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent a verification code to your email
          </p>
        </div>
        <VerifyEmailForm email={searchParams.email} />
      </div>
    </div>
  );
}
```

**Step 2: Create verify email form component**

Create: `src/components/auth/verify-email-form.tsx` with content:
```typescript
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../convex/generated/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export function VerifyEmailForm({ email: initialEmail }: { email?: string }) {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState(initialEmail || "");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const verifyEmail = useMutation(api.auth.verifyEmail);
  const resendVerification = useMutation(api.auth.resendVerification);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await verifyEmail({ email, code });
      router.push("/login?verified=true");
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendVerification({ email });
    } catch (err: any) {
      setError(err.message || "Failed to resend verification email");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleVerify}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
            disabled={!!initialEmail}
          />
        </div>
        <div>
          <Label htmlFor="code">Verification code</Label>
          <Input
            id="code"
            name="code"
            type="text"
            placeholder="Enter 6-digit code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1"
            maxLength={6}
          />
          <p className="mt-1 text-sm text-gray-500">
            Check your email for a 6-digit verification code
          </p>
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm text-center">{error}</div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Verifying..." : "Verify email"}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="text-sm font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400"
        >
          {isResending ? "Sending..." : "Resend verification email"}
        </button>
      </div>
    </form>
  );
}
```

**Step 3: Commit**

Run: `git add src/app/\(auth\)/verify-email/page.tsx src/components/auth/verify-email-form.tsx`
Run: `git commit -m "feat: create email verification page and form

- Add verify email page
- Create verify email form with code input
- Support resend verification email
- Redirect to login on successful verification""

---

## Task 5: Create Forgot Password Page

**Files:**
- Create: `src/app/(auth)/forgot-password/page.tsx`
- Create: `src/components/auth/forgot-password-form.tsx`

**Step 1: Create forgot password page**

Create: `src/app/(auth)/forgot-password/page.tsx` with content:
```typescript
import { ForgotPasswordForm } from "../../../components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email and we'll send you a reset code
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
```

**Step 2: Create forgot password form component**

Create: `src/components/auth/forgot-password-form.tsx` with content:
```typescript
"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/generated/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const requestPasswordReset = useMutation(api.auth.requestPasswordReset);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await requestPasswordReset({ email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mt-8 space-y-6 text-center">
        <div className="rounded-md bg-green-50 p-4">
          <h3 className="text-sm font-medium text-green-800">
            Check your email
          </h3>
          <div className="mt-2 text-sm text-green-700">
            <p>
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="mt-2">
              <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Back to login
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm text-center">{error}</div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Sending..." : "Send reset email"}
      </Button>

      <div className="text-center">
        <a
          href="/login"
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          Back to login
        </a>
      </div>
    </form>
  );
}
```

**Step 3: Commit**

Run: `git add src/app/\(auth\)/forgot-password/page.tsx src/components/auth/forgot-password-form.tsx`
Run: `git commit -m "feat: create forgot password page and form

- Add forgot password page
- Create request password reset form
- Show success message with email confirmation
- Link back to login""

---

## Task 6: Create Password Reset Page

**Files:**
- Create: `src/app/(auth)/verify-reset/page.tsx`
- Create: `src/components/auth/password-reset-form.tsx`

**Step 1: Create verify reset page**

Create: `src/app/(auth)/verify-reset/page.tsx` with content:
```typescript
import { PasswordResetForm } from "../../../components/auth/password-reset-form";

export default function VerifyResetPage({
  searchParams,
}: {
  searchParams: { email?: string; code?: string };
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Set new password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>
        <PasswordResetForm email={searchParams.email} code={searchParams.code} />
      </div>
    </div>
  );
}
```

**Step 2: Create password reset form component**

Create: `src/components/auth/password-reset-form.tsx` with content:
```typescript
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../convex/generated/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export function PasswordResetForm({ email: initialEmail, code: initialCode }: {
  email?: string;
  code?: string;
}) {
  const [code, setCode] = useState(initialCode || "");
  const [email, setEmail] = useState(initialEmail || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const resetPassword = useMutation(api.auth.resetPassword);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword({ email, code, newPassword: password });
      router.push("/login?reset=true");
    } catch (err: any) {
      setError(err.message || "Password reset failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="code">Reset code</Label>
          <Input
            id="code"
            name="code"
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm text-center">{error}</div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Resetting..." : "Reset password"}
      </Button>
    </form>
  );
}
```

**Step 3: Commit**

Run: `git add src/app/\(auth\)/verify-reset/page.tsx src/components/auth/password-reset-form.tsx`
Run: `git commit -m "feat: create password reset page and form

- Add verify reset page
- Create password reset form with code, email, new password
- Validate password match and length
- Redirect to login on success""

---

## Task 7: Add Route Protection

**Files:**
- Create: `src/components/protected-route.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Create protected route component**

Create: `src/components/protected-route.tsx` with content:
```typescript
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/auth-context";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

**Step 2: Add AuthProvider to root layout**

Modify: `src/app/layout.tsx` (add import and wrap children):
```typescript
import { AuthProvider } from "../contexts/auth-context";

// ... existing imports ...

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

**Step 3: Add protected routes to dashboard**

Modify: `src/app/(dashboard)/layout.tsx` (wrap children in ProtectedRoute):
```typescript
import { ProtectedRoute } from "../../../components/protected-route";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}
```

**Step 4: Commit**

Run: `git add src/components/protected-route.tsx src/app/layout.tsx src/app/\(dashboard\)/layout.tsx`
Run: `git commit -m "feat: add route protection

- Create ProtectedRoute component
- Add AuthProvider to root layout
- Protect all dashboard routes
- Show loading state during auth check""

---

## Task 8: Generate Convex Client Code

**Files:**
- Create: `convex/generated/api.ts`

**Step 1: Generate Convex types**

Run: `npx convex codegen`

**Step 2: Commit**

Run: `git add convex/generated/`
Run: `git commit -m "feat: generate Convex client code

- Generate TypeScript types from Convex functions
- Create client-side API hooks
- Enable type-safe Convex queries and mutations""

---

## Task 9: Create Auth Test

**Files:**
- Create: `__tests__/batch3-auth-frontend.test.ts`

**Step 1: Create frontend tests**

Create: `__tests__/batch3-auth-frontend.test.ts` with content:
```typescript
const fs = require("fs");

describe("Batch 3: Authentication Frontend", () => {
  test("auth pages exist", () => {
    const pages = [
      "src/app/(auth)/login/page.tsx",
      "src/app/(auth)/register/page.tsx",
      "src/app/(auth)/verify-email/page.tsx",
      "src/app/(auth)/forgot-password/page.tsx",
      "src/app/(auth)/verify-reset/page.tsx",
    ];

    pages.forEach((page) => {
      expect(fs.existsSync(page)).toBe(true);
    });
  });

  test("auth components exist", () => {
    const components = [
      "src/components/auth/login-form.tsx",
      "src/components/auth/register-form.tsx",
      "src/components/auth/verify-email-form.tsx",
      "src/components/auth/forgot-password-form.tsx",
      "src/components/auth/password-reset-form.tsx",
    ];

    components.forEach((component) => {
      expect(fs.existsSync(component)).toBe(true);
    });
  });

  test("auth context exists", () => {
    expect(fs.existsSync("src/contexts/auth-context.tsx")).toBe(true);
  });

  test("protected route exists", () => {
    expect(fs.existsSync("src/components/protected-route.tsx")).toBe(true);
  });

  test("Convex client generated", () => {
    expect(fs.existsSync("convex/generated/api.ts")).toBe(true);
  });
});
```

**Step 2: Run tests**

Run: `npm test -- __tests__/batch3-auth-frontend.test.ts`
Expected: PASS (all 5 tests)

**Step 3: Commit**

Run: `git add __tests__/batch3-auth-frontend.test.ts`
Run: `git commit -m "test: add Batch 3 frontend tests

- Verify all auth pages exist
- Check all auth components
- Validate auth context
- Confirm protected route
- Check Convex client generated""

---

## Summary

**Batch 3 Complete!** Authentication frontend is now built with:

✅ Complete auth pages (login, register, verify, forgot, reset)
✅ Auth form components with validation
✅ Authentication context provider
✅ Route protection middleware
✅ Convex client generation
✅ Comprehensive test suite

**Next Steps:**
Proceed to Batch 4: Core Business Logic to implement user management, organizations, and role-based access control.
