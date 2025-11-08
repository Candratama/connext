"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/generated/api.js";

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

  const loginAction = useAction(api["functions/auth"].login);

  // Get current user from sessionStorage on mount
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user:", e);
        sessionStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const result = await loginAction({ email, password });

    if (!result.success) {
      // Throw error with the specific error code so login form can handle it
      const error = new Error(result.message);
      error.name = result.error;
      throw error;
    }

    // Store user in sessionStorage
    sessionStorage.setItem("user", JSON.stringify(result.user));
    setUser(result.user);
  };

  const logout = () => {
    // Remove user from sessionStorage
    sessionStorage.removeItem("user");
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
