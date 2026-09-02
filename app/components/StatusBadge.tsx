"use client";

import { SubscriptionStatus } from "@/types";

interface StatusBadgeProps {
  status: SubscriptionStatus;
}

const statusConfig: Record<
  SubscriptionStatus,
  { label: string; className: string }
> = {
  [SubscriptionStatus.TRIALING]: {
    label: "Trialing",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  [SubscriptionStatus.ACTIVE]: {
    label: "Active",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  [SubscriptionStatus.PAST_DUE]: {
    label: "Past Due",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  [SubscriptionStatus.SUSPENDED]: {
    label: "Suspended",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  [SubscriptionStatus.CANCELED]: {
    label: "Canceled",
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
