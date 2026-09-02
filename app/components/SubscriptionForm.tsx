"use client";

import { useState, FormEvent } from "react";
import {
  Subscription,
  SubscriptionStatus,
  BillingInterval,
} from "@/types";
import { updateSubscription } from "@/lib/api/endpoints";
import { toDateTimeLocalValue, toISO8601 } from "@/lib/utils/format";
import { validateDateRange } from "@/lib/utils/validation";

interface SubscriptionFormProps {
  businessId: string;
  subscription: Subscription;
  onSuccess: () => void;
  onCancel: () => void;
}

export function SubscriptionForm({
  businessId,
  subscription,
  onSuccess,
  onCancel,
}: SubscriptionFormProps) {
  const [status, setStatus] = useState(subscription.status);
  const [billingInterval, setBillingInterval] = useState(
    subscription.billingInterval
  );
  const [currentPeriodStart, setCurrentPeriodStart] = useState(
    toDateTimeLocalValue(subscription.currentPeriodStart)
  );
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState(
    toDateTimeLocalValue(subscription.currentPeriodEnd)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationError(null);

    // Client-side validation
    const startISO = currentPeriodStart
      ? toISO8601(new Date(currentPeriodStart))
      : null;
    const endISO = currentPeriodEnd
      ? toISO8601(new Date(currentPeriodEnd))
      : null;

    const rangeError = validateDateRange(startISO, endISO);
    if (rangeError) {
      setValidationError(rangeError);
      return;
    }

    try {
      setIsSubmitting(true);

      await updateSubscription(businessId, {
        status,
        billingInterval,
        currentPeriodStart: startISO || undefined,
        currentPeriodEnd: endISO || undefined,
      });

      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update subscription"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {Object.values(SubscriptionStatus).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Billing Interval
        </label>
        <select
          value={billingInterval}
          onChange={(e) =>
            setBillingInterval(e.target.value as BillingInterval)
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {Object.values(BillingInterval).map((interval) => (
            <option key={interval} value={interval}>
              {interval}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Current Period Start
        </label>
        <input
          type="datetime-local"
          value={currentPeriodStart}
          onChange={(e) => setCurrentPeriodStart(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Current Period End
        </label>
        <input
          type="datetime-local"
          value={currentPeriodEnd}
          onChange={(e) => setCurrentPeriodEnd(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {validationError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {validationError}
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
