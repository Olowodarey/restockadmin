"use client";

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/useAuth";
import { useUserBusinesses } from "@/lib/hooks/useUserBusinesses";
import { getUserEntitlements, updateEntitlements, createBusinessForUser } from "@/lib/api/endpoints";
import { UserEntitlements } from "@/types";
import { Navigation } from "../../components/Navigation";
import { ErrorMessage } from "../../components/ErrorMessage";
import { LoadingSpinner, LoadingScreen } from "../../components/LoadingSpinner";
import { StatusBadge } from "../../components/StatusBadge";
import { formatDate } from "@/lib/utils/format";

export default function ManageOwnerPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const {
    data: businesses,
    isLoading: businessesLoading,
    error: businessesError,
    mutate: refetchBusinesses,
  } = useUserBusinesses(userId);

  const [entitlements, setEntitlements] = useState<UserEntitlements | null>(null);
  const [entitlementsLoading, setEntitlementsLoading] = useState(true);
  const [entitlementsError, setEntitlementsError] = useState<string | null>(null);

  const [maxShops, setMaxShops] = useState("");
  const [maxStaff, setMaxStaff] = useState("");
  const [isSavingEntitlements, setIsSavingEntitlements] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const [newShopName, setNewShopName] = useState("");
  const [isAddingShop, setIsAddingShop] = useState(false);
  const [addShopError, setAddShopError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    (async () => {
      try {
        setEntitlementsLoading(true);
        setEntitlementsError(null);
        const data = await getUserEntitlements(userId);
        if (active) {
          setEntitlements(data);
          setMaxShops(String(data.maxShops));
          setMaxStaff(String(data.maxStaff));
        }
      } catch (err) {
        if (active) {
          setEntitlementsError(
            err instanceof Error ? err.message : "Failed to load entitlements"
          );
        }
      } finally {
        if (active) setEntitlementsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [userId, isAuthenticated]);

  if (authLoading) return <LoadingScreen message="Loading..." />;
  if (!isAuthenticated) return null;

  const handleSaveEntitlements = async (e: FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    const shopsNum = Number.parseInt(maxShops, 10);
    const staffNum = Number.parseInt(maxStaff, 10);
    if (!Number.isFinite(shopsNum) || shopsNum < 0 || !Number.isFinite(staffNum) || staffNum < 0) {
      setSaveError("Enter valid non-negative numbers for both fields.");
      return;
    }

    try {
      setIsSavingEntitlements(true);
      const updated = await updateEntitlements(userId, { maxShops: shopsNum, maxStaff: staffNum });
      setEntitlements((prev) => (prev ? { ...prev, ...updated } : prev));
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save entitlements");
    } finally {
      setIsSavingEntitlements(false);
    }
  };

  const handleAddShop = async (e: FormEvent) => {
    e.preventDefault();
    setAddShopError(null);

    if (!newShopName.trim()) {
      setAddShopError("Enter a shop name.");
      return;
    }

    try {
      setIsAddingShop(true);
      await createBusinessForUser(userId, { name: newShopName.trim() });
      setNewShopName("");
      refetchBusinesses();
    } catch (err) {
      setAddShopError(err instanceof Error ? err.message : "Failed to add shop");
    } finally {
      setIsAddingShop(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {entitlements?.name ?? "Manage Owner"}
          </h1>
          <p className="mt-1 text-sm text-gray-600">{entitlements?.email}</p>
        </div>

        {/* Entitlements */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Entitlements</h2>
          <p className="mt-1 text-sm text-gray-600">
            Account-wide caps for this owner &mdash; set these to whatever they
            actually paid for. Independent of any one shop&apos;s subscription
            status.
          </p>

          {entitlementsLoading ? (
            <div className="mt-4 flex justify-center">
              <LoadingSpinner className="h-8 w-8" />
            </div>
          ) : entitlementsError ? (
            <div className="mt-4">
              <ErrorMessage message={entitlementsError} />
            </div>
          ) : (
            <form onSubmit={handleSaveEntitlements} className="mt-4 space-y-4">
              {showSaveSuccess && (
                <div className="rounded-md bg-green-50 p-3">
                  <p className="text-sm font-medium text-green-800">Saved</p>
                </div>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Max shops
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={maxShops}
                    onChange={(e) => setMaxShops(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Max staff (account-wide, not per shop)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={maxStaff}
                    onChange={(e) => setMaxStaff(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {saveError && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                  {saveError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSavingEntitlements}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSavingEntitlements ? "Saving..." : "Save"}
              </button>
            </form>
          )}
        </div>

        {/* Shops managed */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Shops Managed</h2>

          {businessesLoading ? (
            <div className="mt-4 flex justify-center">
              <LoadingSpinner className="h-8 w-8" />
            </div>
          ) : businessesError ? (
            <div className="mt-4">
              <ErrorMessage message={businessesError} />
            </div>
          ) : businesses && businesses.length > 0 ? (
            <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Created
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {businesses.map((business) => (
                    <tr key={business.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                        {business.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <StatusBadge status={business.subscription.status} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                        {formatDate(business.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                        <Link
                          href={`/businesses/${business.id}`}
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-500">No shops yet.</p>
          )}

          <form onSubmit={handleAddShop} className="mt-6 flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Add a shop for this owner
              </label>
              <input
                type="text"
                value={newShopName}
                onChange={(e) => setNewShopName(e.target.value)}
                placeholder="Shop name"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={isAddingShop}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isAddingShop ? "Adding..." : "Add Shop"}
            </button>
          </form>
          {addShopError && (
            <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-800">
              {addShopError}
            </div>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Bypasses this owner&apos;s own shop-count limit &mdash; use when
            they&apos;ve asked you directly to add a shop, rather than raising
            their Max Shops above and letting them self-serve in the app.
          </p>
        </div>
      </main>
    </div>
  );
}
