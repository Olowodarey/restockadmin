"use client";

import { useState, useEffect } from "react";
import { DashboardStats } from "@/types";
import { getStats } from "@/lib/api/endpoints";

export function useStats() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchStats() {
      try {
        setIsLoading(true);
        setError(null);
        const stats = await getStats();
        if (mounted) {
          setData(stats);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load statistics"
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchStats();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, isLoading, error };
}
