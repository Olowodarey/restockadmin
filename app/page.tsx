"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";
import { useStats } from "@/lib/hooks/useStats";
import { Navigation } from "./components/Navigation";
import { StatsCard } from "./components/StatsCard";
import { ErrorMessage } from "./components/ErrorMessage";
import { LoadingSpinner, LoadingScreen } from "./components/LoadingSpinner";
import { SubscriptionStatus } from "@/types";

export default function HomePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { data, isLoading: statsLoading, error } = useStats();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  if (!isAuthenticated) {
    return null; // Redirecting
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {statsLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <LoadingSpinner className="h-12 w-12" />
          </div>
        ) : error ? (
          <ErrorMessage message={error} />
        ) : !data ? (
          <ErrorMessage message="No statistics available" />
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                System-wide statistics and subscription overview
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <StatsCard
                title="Total Businesses"
                value={data.totalBusinesses}
                variant="info"
                href="/businesses"
              />
              <StatsCard
                title="Trialing"
                value={data.byStatus[SubscriptionStatus.TRIALING] || 0}
                variant="info"
                href={`/businesses?status=${SubscriptionStatus.TRIALING}`}
              />
              <StatsCard
                title="Active"
                value={data.byStatus[SubscriptionStatus.ACTIVE] || 0}
                variant="success"
                href={`/businesses?status=${SubscriptionStatus.ACTIVE}`}
              />
              <StatsCard
                title="Past Due"
                value={data.byStatus[SubscriptionStatus.PAST_DUE] || 0}
                variant="warning"
                href={`/businesses?status=${SubscriptionStatus.PAST_DUE}`}
              />
              <StatsCard
                title="Suspended"
                value={data.byStatus[SubscriptionStatus.SUSPENDED] || 0}
                variant="error"
                href={`/businesses?status=${SubscriptionStatus.SUSPENDED}`}
              />
              <StatsCard
                title="Canceled"
                value={data.byStatus[SubscriptionStatus.CANCELED] || 0}
                variant="gray"
                href={`/businesses?status=${SubscriptionStatus.CANCELED}`}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
