"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/generated/api.js";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

// Layer 1: Entry Point Validation - Prevent buffer overflow and invalid input
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .max(254, "Email must be less than 254 characters")
    .email("Invalid email address")
    .refine((email) => !email.includes('\x00'), "Invalid characters in email"),
});

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const requestPasswordReset = useAction(api["functions/auth"].requestPasswordReset);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Layer 1: Entry Point Validation - Validate input before submission
    try {
      const validatedData = forgotPasswordSchema.parse({
        email: email.trim(),
      });

      // If validation passes, proceed with request
      await requestPasswordReset({ email: validatedData.email });
      setSuccess(true);
    } catch (err: any) {
      // Handle Zod validation errors
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError(err.message || "Failed to send reset email");
      }
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
          maxLength={254}
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
