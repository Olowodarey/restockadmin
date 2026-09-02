"use client";

type Variant = "default" | "success" | "info" | "warning" | "error" | "gray";

interface StatsCardProps {
  title: string;
  value: number | string;
  variant?: Variant;
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
}: StatsCardProps) {
  return (
    <div
      className={`rounded-lg border p-6 ${variantStyles[variant]}`}
    >
      <h3 className="text-sm font-medium opacity-75">{title}</h3>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
