"use client";

import Link from "next/link";
import { Business } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "@/lib/utils/format";

interface BusinessTableProps {
  businesses: Business[];
}

export function BusinessTable({ businesses }: BusinessTableProps) {
  if (businesses.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-sm text-gray-500">No businesses found</p>
      </div>
    );
  }

  // Sort by creation date descending
  const sortedBusinesses = [...businesses].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Business Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Owner Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Created
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {sortedBusinesses.map((business) => (
            <tr
              key={business.id}
              className="cursor-pointer hover:bg-gray-50"
            >
              <td className="whitespace-nowrap px-6 py-4">
                <Link
                  href={`/businesses/${business.id}`}
                  className="font-medium text-blue-600 hover:text-blue-800"
                >
                  {business.name}
                </Link>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {business.users[0]?.email || "N/A"}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <StatusBadge status={business.subscription.status} />
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {formatDate(business.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
