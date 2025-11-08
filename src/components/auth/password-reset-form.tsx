"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAction } from "convex/react";
import { api } from "@/convex/generated/api.js";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

// Layer 1: Entry Point Validation - Prevent buffer overflow and invalid input
const passwordResetSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .max(254, "Email must be less than 254 characters")
    .email("Invalid email address")
    .refine((email) => !email.includes('\x00'), "Invalid characters in email"),
  code: z
    .string()
    .min(1, "Reset code is required")
    .max(10, "Invalid reset code")
    .refine((code) => !code.includes('\x00'), "Invalid characters in code"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters")
    .refine((password) => !password.includes('\x00'), "Invalid characters in password")
    .refine(
      (password) => /[A-Za-z]/.test(password) && /\d/.test(password),
      "Password must contain at least one letter and one number"
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export function PasswordResetForm({ email: initialEmail, code: initialCode }: {
  email?: string;
  code?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read code and email from URL parameters
  const codeFromUrl = searchParams.get("code") || initialCode || "";
  const emailFromUrl = searchParams.get("email") || initialEmail || "";

  const [code, setCode] = useState(codeFromUrl);
  const [email, setEmail] = useState(emailFromUrl);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const resetPasswordAction = useAction(api["functions/auth"].resetPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Layer 1: Entry Point Validation - Validate input before submission
    try {
      const validatedData = passwordResetSchema.parse({
        email: email.trim(),
        code: code.trim(),
        password,
        confirmPassword,
      });

      // If validation passes, proceed with reset
      const result = await resetPasswordAction({
        email: validatedData.email,
        code: validatedData.code,
        newPassword: validatedData.password,
      });

      if (!result.success) {
        setError(result.message);
      } else {
        router.push("/login?reset=true");
      }
    } catch (err: any) {
      // Handle Zod validation errors
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError(err.message || "Password reset failed");
      }
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
            maxLength={254}
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
            maxLength={10}
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
            maxLength={128}
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
            maxLength={128}
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
