"use client";

import { useState, useEffect, useCallback } from "react";
import { Business } from "@/types";
import { getUserBusinesses } from "@/lib/api/endpoints";

export function useUserBusinesses(userId: string) {
  const [data, setData] = useState<Business[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinesses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const businesses = await getUserBusinesses(userId);
      setData(businesses);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load this owner's shops"
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const mutate = useCallback(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  return { data, isLoading, error, mutate };
}
