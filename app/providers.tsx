"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { googleConfig } from "@/lib/auth/google";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={googleConfig.clientId}>
      <AuthProvider>{children}</AuthProvider>
    </GoogleOAuthProvider>
  );
}
