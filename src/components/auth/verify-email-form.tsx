"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/generated/api.js";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

// Layer 1: Entry Point Validation - Prevent buffer overflow and invalid input
const verifyEmailSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .max(254, "Email must be less than 254 characters")
    .email("Invalid email address")
    .refine((email) => !email.includes('\x00'), "Invalid characters in email"),
  code: z
    .string()
    .min(1, "Verification code is required")
    .max(6, "Invalid verification code")
    .refine((code) => /^\d{6}$/.test(code), "Verification code must be 6 digits")
    .refine((code) => !code.includes('\x00'), "Invalid characters in code"),
});

export function VerifyEmailForm({ email: initialEmail }: { email?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read code and email from URL parameters
  const codeFromUrl = searchParams.get("code") || "";
  const emailFromUrl = searchParams.get("email") || initialEmail || "";

  const [code, setCode] = useState(codeFromUrl);
  const [email, setEmail] = useState(emailFromUrl);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const verifyEmail = useMutation(api["functions/auth"].verifyEmail);
  const resendVerification = useAction(api["functions/auth"].resendVerification);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Layer 1: Entry Point Validation - Validate input before submission
    try {
      const validatedData = verifyEmailSchema.parse({
        email: email.trim(),
        code: code.trim(),
      });

      // If validation passes, proceed with verification
      await verifyEmail({
        email: validatedData.email,
        code: validatedData.code,
      });
      router.push("/login?verified=true");
    } catch (err: any) {
      // Handle Zod validation errors
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError(err.message || "Verification failed");
      }
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
            maxLength={254}
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
