"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";
import { useBusinesses } from "@/lib/hooks/useBusinesses";
import { Navigation } from "../components/Navigation";
import { BusinessTable } from "../components/BusinessTable";
import { ErrorMessage } from "../components/ErrorMessage";
import { LoadingSpinner, LoadingScreen } from "../components/LoadingSpinner";

export default function BusinessesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading, error } = useBusinesses(searchQuery || undefined);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const handleClear = () => {
    setSearchInput("");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Businesses</h1>
            <p className="mt-1 text-sm text-gray-600">
              Browse and manage all registered businesses
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              placeholder="Search businesses by name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Search
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Clear
              </button>
            )}
          </form>

          {isLoading && (
            <div className="flex min-h-[400px] items-center justify-center">
              <LoadingSpinner className="h-12 w-12" />
            </div>
          )}

          {error && <ErrorMessage message={error} />}

          {!isLoading && !error && <BusinessTable businesses={data} />}
        </div>
      </main>
    </div>
  );
}
