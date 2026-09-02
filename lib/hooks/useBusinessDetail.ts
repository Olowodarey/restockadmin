"use client";

import { useState, useEffect, useCallback } from "react";
import { Business } from "@/types";
import { getBusinessDetail } from "@/lib/api/endpoints";

export function useBusinessDetail(id: string) {
  const [data, setData] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusiness = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const business = await getBusinessDetail(id);
      setData(business);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load business details"
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBusiness();
  }, [fetchBusiness]);

  const mutate = useCallback(() => {
    fetchBusiness();
  }, [fetchBusiness]);

  return { data, isLoading, error, mutate };
}
