"use client";

import { useState, useEffect } from "react";
import { Business } from "@/types";
import { getBusinesses } from "@/lib/api/endpoints";

export function useBusinesses(search?: string) {
  const [data, setData] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchBusinesses() {
      try {
        setIsLoading(true);
        setError(null);
        const businesses = await getBusinesses(search);
        if (mounted) {
          setData(businesses);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load businesses"
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchBusinesses();

    return () => {
      mounted = false;
    };
  }, [search]);

  return { data, isLoading, error };
}
