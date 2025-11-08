"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "convex/react";
import { api } from "@/convex/generated/api.js";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { GoogleLoginButton } from "./google-login-button";

// Layer 1: Entry Point Validation - Prevent buffer overflow and invalid input
const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .refine((name) => !name.includes('\x00'), "Invalid characters in name"),
  email: z
    .string()
    .min(1, "Email is required")
    .max(254, "Email must be less than 254 characters")
    .email("Invalid email address")
    .refine((email) => !email.includes('\x00'), "Invalid characters in email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters")
    .refine((password) => !password.includes('\x00'), "Invalid characters in password")
    .refine(
      (password) => /[A-Za-z]/.test(password) && /\d/.test(password),
      "Password must contain at least one letter and one number"
    ),
});

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const register = useAction(api["functions/auth"].register);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Layer 1: Entry Point Validation - Validate input before submission
    try {
      const validatedData = registerSchema.parse({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      // If validation passes, proceed with registration
      await register({
        email: validatedData.email,
        name: validatedData.name,
        password: validatedData.password,
      });
      setSuccess(true);
      // Redirect to verification page after 2 seconds
      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(validatedData.email)}`);
      }, 2000);
    } catch (err: any) {
      // Handle Zod validation errors
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError(err.message || "Registration failed");
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
      <GoogleLoginButton
        onError={(error) => setError(error)}
      />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-50 text-gray-500">Or continue with email</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            maxLength={100}
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
            autoComplete="new-password"
            required
            maxLength={128}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1"
          />
          <p className="mt-1 text-sm text-gray-500">
            Must be at least 8 characters, with letters and numbers
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
