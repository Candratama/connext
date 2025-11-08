"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

interface GoogleLoginButtonProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export function GoogleLoginButton({ onSuccess, onError }: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const isConfigured = Boolean(clientId);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);

      // Check if Google Client ID is configured
      if (!isConfigured) {
        throw new Error("Google OAuth is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your environment variables.");
      }

      // Check if Google script is loaded
      if (!window.google) {
        await loadGoogleScript();
      }

      // Create a temporary div for the Google button
      const buttonContainer = document.createElement("div");
      buttonContainer.style.display = "none";
      document.body.appendChild(buttonContainer);

      // Initialize and render the Google button
      window.google.accounts.id.initialize({
        client_id: clientId!,
        callback: (response: any) => {
          handleCredentialResponse(response);
          // Clean up
          document.body.removeChild(buttonContainer);
        },
      });

      // Render the Google Sign-In button
      window.google.accounts.id.renderButton(buttonContainer, {
        theme: "outline",
        size: "large",
        width: 300,
      });

      // Trigger the button click
      const button = buttonContainer.querySelector("div") as HTMLElement;
      if (button) {
        button.click();
      }
    } catch (error) {
      console.error("Google login error:", error);
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      onError?.(errorMessage);
      setIsLoading(false);
    }
  };

  const handleCredentialResponse = async (response: any) => {
    try {
      // Send the credential to backend
      const result = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential: response.credential }),
      });

      if (!result.ok) {
        const errorData = await result.json();
        throw new Error(errorData.error || "Authentication failed");
      }

      const data = await result.json();

      if (data.success && data.user) {
        // Use the auth context to login
        login(data.user);

        // Call onSuccess callback
        onSuccess?.(data.user);

        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Google auth error:", error);
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGoogleScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
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
      title={!isConfigured ? "Google OAuth not configured - set NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local" : ""}
    >
      {isLoading ? (
        "Signing in..."
      ) : !isConfigured ? (
        <>
          <svg
            className="mr-2 h-4 w-4"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#9CA3AF"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#9CA3AF"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#9CA3AF"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#9CA3AF"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google OAuth Not Configured
        </>
      ) : (
        <>
          <svg
            className="mr-2 h-4 w-4"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </>
      )}
    </Button>
  );
}
