"use client";

import { Suspense, useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";
import { useBusinesses } from "@/lib/hooks/useBusinesses";
import { SubscriptionStatus } from "@/types";
import { Navigation } from "../components/Navigation";
import { BusinessTable } from "../components/BusinessTable";
import { ErrorMessage } from "../components/ErrorMessage";
import { LoadingSpinner, LoadingScreen } from "../components/LoadingSpinner";

const STATUS_FILTERS: { label: string; value?: SubscriptionStatus }[] = [
  { label: "All" },
  { label: "Trialing", value: SubscriptionStatus.TRIALING },
  { label: "Active", value: SubscriptionStatus.ACTIVE },
  { label: "Past Due", value: SubscriptionStatus.PAST_DUE },
  { label: "Suspended", value: SubscriptionStatus.SUSPENDED },
  { label: "Canceled", value: SubscriptionStatus.CANCELED },
];

// useSearchParams() opts this page out of static rendering, which Next.js
// requires be wrapped in Suspense — split into an inner component so the
// page export itself can provide that boundary.
export default function BusinessesPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading..." />}>
      <BusinessesPageContent />
    </Suspense>
  );
}

function BusinessesPageContent() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // The status filter lives in the URL (not just component state) so the
  // dashboard's "Active"/"Trialing"/etc. stat cards can link straight to a
  // pre-filtered view — that's what actually answers "show me who's
  // subscribed" in one click, not just a count.
  const statusParam = searchParams.get("status") as SubscriptionStatus | null;
  const status = statusParam ?? undefined;

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading, error } = useBusinesses(
    searchQuery || undefined,
    status
  );

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

  const setStatusFilter = (value?: SubscriptionStatus) => {
    router.push(value ? `/businesses?status=${value}` : "/businesses");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Businesses</h1>
            <p className="mt-1 text-sm text-gray-600">
              Browse and manage all registered businesses and their subscriptions
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((filter) => {
              const isActive = status === filter.value;
              return (
                <button
                  key={filter.label}
                  type="button"
                  onClick={() => setStatusFilter(filter.value)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                    isActive
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
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
