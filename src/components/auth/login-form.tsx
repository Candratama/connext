"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth } from "../../contexts/auth-context";

// Layer 1: Entry Point Validation - Prevent buffer overflow and invalid input
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .max(254, "Email must be less than 254 characters")
    .email("Invalid email address")
    .refine((email) => !email.includes('\x00'), "Invalid characters in email"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password must be less than 128 characters")
    .refine((password) => !password.includes('\x00'), "Invalid characters in password"),
});

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNeedsVerification(false);
    setIsLoading(true);

    // Layer 1: Entry Point Validation - Validate input before submission
    try {
      const validatedData = loginSchema.parse({
        email: email.trim(),
        password,
      });

      // If validation passes, proceed with login
      await login(validatedData.email, validatedData.password);
      router.push("/dashboard");
    } catch (err: any) {
      // Handle Zod validation errors
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (err.name === "EMAIL_NOT_VERIFIED") {
        // Handle authentication-specific errors
        setNeedsVerification(true);
        setError(err.message);
      } else {
        setError(err.message || "Invalid email or password");
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
            autoComplete="email"
            required
            maxLength={254}
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
            maxLength={128}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-red-600 text-sm text-center">{error}</div>
          {needsVerification && (
            <div className="mt-2 text-center">
              <a
                href={`/verify-email?email=${encodeURIComponent(email)}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Go to verification page
              </a>
            </div>
          )}
        </div>
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
