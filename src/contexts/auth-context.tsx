"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

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
  // For now, we'll check localStorage or skip this check
  useEffect(() => {
    // TODO: Implement getCurrentUser query in Batch 4
    // const getCurrentUser = useQuery(api.users.getCurrentUser);
    // if (getCurrentUser !== undefined) {
    //   setUser(getCurrentUser);
    //   setIsLoading(false);
    // }
    setIsLoading(false);
  }, []);

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
