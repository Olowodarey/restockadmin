"use client";

import Link from "next/link";

type Variant = "default" | "success" | "info" | "warning" | "error" | "gray";

interface StatsCardProps {
  title: string;
  value: number | string;
  variant?: Variant;
  // When set, the whole card links to the filtered businesses list — this
  // is what turns "12 Active" from a bare count into an actual answer to
  // "which businesses are subscribed."
  href?: string;
}

const variantStyles: Record<Variant, string> = {
  default: "bg-blue-50 text-blue-700 border-blue-200",
  success: "bg-green-50 text-green-700 border-green-200",
  info: "bg-cyan-50 text-cyan-700 border-cyan-200",
  warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
  error: "bg-red-50 text-red-700 border-red-200",
  gray: "bg-gray-50 text-gray-700 border-gray-200",
};

export function StatsCard({
  title,
  value,
  variant = "default",
  href,
}: StatsCardProps) {
  const className = `rounded-lg border p-6 ${variantStyles[variant]} ${
    href ? "block transition hover:opacity-80" : ""
  }`;

  const content = (
    <>
      <h3 className="text-sm font-medium opacity-75">{title}</h3>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
