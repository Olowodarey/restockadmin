"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/lib/auth/useAuth";

export default function LoginPage() {
  const { signIn, isAuthenticated, isLoading, error } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSuccess = async (credentialResponse: { credential?: string }) => {
    if (credentialResponse.credential) {
      await signIn(credentialResponse.credential);
    }
  };

  const handleError = () => {
    console.error("Google Sign-In failed");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-600">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Redirecting
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Restock Admin Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in with your master admin Google account
          </p>
        </div>

        <div className="rounded-lg bg-white px-6 py-8 shadow-md">
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              useOneTap={false}
            />
          </div>

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-500">
          Only accounts with master admin access can sign in
        </p>
      </div>
    </div>
  );
}
