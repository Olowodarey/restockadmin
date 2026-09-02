"use client";

import { UserRole } from "@/types";

interface RoleBadgeProps {
  role: UserRole;
}

const roleConfig: Record<UserRole, { label: string; className: string }> = {
  [UserRole.MASTER_ADMIN]: {
    label: "Master Admin",
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
  [UserRole.OWNER]: {
    label: "Owner",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const config = roleConfig[role];

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
