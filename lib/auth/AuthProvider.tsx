"use client";

import React, { createContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User, UserRole } from "@/types";
import { saveSession, loadSession, clearSession } from "./storage";
import { signInWithGoogle } from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/client";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (idToken: string) => Promise<void>;
  signOut: () => void;
  error: string | null;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Restore session on mount
  useEffect(() => {
    const session = loadSession();
    if (session) {
      setUser(session.user);
      setToken(session.accessToken);
      apiClient.setToken(session.accessToken);
    }
    setIsLoading(false);
  }, []);

  // Set up 401 handler
  useEffect(() => {
    apiClient.setUnauthorizedHandler(() => {
      clearSession();
      setUser(null);
      setToken(null);
      router.push("/login");
    });
  }, [router]);

  // Sign in with Google
  const signIn = useCallback(
    async (idToken: string) => {
      try {
        setError(null);
        setIsLoading(true);

        // Call backend to exchange ID token for access token
        const response = await signInWithGoogle({ idToken });

        // Validate user role
        if (response.user.role !== UserRole.MASTER_ADMIN) {
          setError("This account doesn't have admin access");
          clearSession();
          setIsLoading(false);
          return;
        }

        // Store session
        const session = {
          accessToken: response.accessToken,
          user: response.user,
        };
        saveSession(session);

        // Update state
        setUser(response.user);
        setToken(response.accessToken);
        apiClient.setToken(response.accessToken);

        setIsLoading(false);

        // Redirect to home
        router.push("/");
      } catch (err) {
        console.error("Sign in failed:", err);
        setError(
          err instanceof Error ? err.message : "Failed to sign in with Google"
        );
        setIsLoading(false);
      }
    },
    [router]
  );

  // Sign out
  const signOut = useCallback(() => {
    clearSession();
    setUser(null);
    setToken(null);
    apiClient.setToken(null);
    router.push("/login");
  }, [router]);

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    signIn,
    signOut,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
