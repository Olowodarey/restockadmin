"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";
import { useBusinessDetail } from "@/lib/hooks/useBusinessDetail";
import { Navigation } from "../../components/Navigation";
import { ErrorMessage } from "../../components/ErrorMessage";
import { LoadingSpinner, LoadingScreen } from "../../components/LoadingSpinner";
import { StatusBadge } from "../../components/StatusBadge";
import { RoleBadge } from "../../components/RoleBadge";
import { SubscriptionForm } from "../../components/SubscriptionForm";
import { formatDate } from "@/lib/utils/format";

export default function BusinessDetailPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: business, isLoading, error, mutate } = useBusinessDetail(id);
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

  const handleSuccess = () => {
    setIsEditing(false);
    setShowSuccess(true);
    mutate();
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <LoadingSpinner className="h-12 w-12" />
          </div>
        ) : error ? (
          <ErrorMessage message={error} />
        ) : !business ? (
          <ErrorMessage message="Business not found" />
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
              <p className="mt-1 text-sm text-gray-600">
                Business details and subscription management
              </p>
            </div>

            {showSuccess && (
              <div className="rounded-md bg-green-50 p-4">
                <p className="text-sm font-medium text-green-800">
                  Subscription updated successfully
                </p>
              </div>
            )}

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Business Information
              </h2>
              <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{business.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {business.phone || "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {business.address || "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(business.createdAt)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900">Users</h2>
              <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {business.memberships.map((membership) => (
                      <tr key={membership.id}>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                          {membership.user.email}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                          {membership.user.name}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <RoleBadge role={membership.user.role} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                          {formatDate(membership.user.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Subscription</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="mt-4">
                  <SubscriptionForm
                    businessId={business.id}
                    subscription={business.subscription}
                    onSuccess={handleSuccess}
                    onCancel={() => setIsEditing(false)}
                  />
                </div>
              ) : (
                <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1">
                      <StatusBadge status={business.subscription.status} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Billing Interval
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {business.subscription.billingInterval}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Period Start
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(business.subscription.currentPeriodStart)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Period End</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(business.subscription.currentPeriodEnd)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(business.subscription.createdAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Last Updated
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(business.subscription.updatedAt)}
                    </dd>
                  </div>
                </dl>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
