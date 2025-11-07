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
      // Resend functionality will be implemented
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
