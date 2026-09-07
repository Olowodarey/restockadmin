"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";
import { getSettings, updateSettings } from "@/lib/api/endpoints";
import { Navigation } from "../components/Navigation";
import { ErrorMessage } from "../components/ErrorMessage";
import { LoadingSpinner, LoadingScreen } from "../components/LoadingSpinner";

export default function SettingsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [trialDays, setTrialDays] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const settings = await getSettings();
        if (mounted) setTrialDays(String(settings.trialDays));
      } catch (err) {
        if (mounted) {
          setLoadError(
            err instanceof Error ? err.message : "Failed to load settings"
          );
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  if (authLoading) return <LoadingScreen message="Loading..." />;
  if (!isAuthenticated) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    const parsed = Number.parseInt(trialDays, 10);
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 3650) {
      setSaveError("Enter a number of days between 1 and 3650.");
      return;
    }

    try {
      setIsSaving(true);
      const updated = await updateSettings({ trialDays: parsed });
      setTrialDays(String(updated.trialDays));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to save settings"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-600">
            Global settings applied across all businesses
          </p>
        </div>

        {isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <LoadingSpinner className="h-10 w-10" />
          </div>
        ) : loadError ? (
          <ErrorMessage message={loadError} />
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Free trial</h2>
            <p className="mt-1 text-sm text-gray-600">
              How many days of free access a business gets when it first signs
              up. This is a default applied to <strong>new</strong> signups only
              &mdash; changing it never shortens or extends a trial that has
              already started. To change one specific business, edit its
              subscription from its detail page.
            </p>

            {showSuccess && (
              <div className="mt-4 rounded-md bg-green-50 p-3">
                <p className="text-sm font-medium text-green-800">
                  Settings saved
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="trialDays"
                  className="block text-sm font-medium text-gray-700"
                >
                  Trial length (days)
                </label>
                <input
                  id="trialDays"
                  type="number"
                  min={1}
                  max={3650}
                  value={trialDays}
                  onChange={(e) => setTrialDays(e.target.value)}
                  className="mt-1 block w-40 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {saveError && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                  {saveError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
