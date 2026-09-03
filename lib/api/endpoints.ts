import { SubscriptionStatus } from "@/types";
import { apiClient } from "./client";
import {
  SignInRequest,
  SignInResponse,
  StatsResponse,
  BusinessListResponse,
  BusinessDetailResponse,
  UpdateSubscriptionRequest,
  UpdateSubscriptionResponse,
} from "./types";

/**
 * Sign in with Google ID token
 */
export async function signInWithGoogle(
  request: SignInRequest
): Promise<SignInResponse> {
  return apiClient.post<SignInResponse>("/auth/google", request);
}

/**
 * Get dashboard statistics
 */
export async function getStats(): Promise<StatsResponse> {
  return apiClient.get<StatsResponse>("/admin/stats");
}

/**
 * Get list of businesses, optionally filtered by name search and/or
 * subscription status (the latter is what powers "show me who's actually
 * subscribed", not just a count).
 */
export async function getBusinesses(
  search?: string,
  status?: SubscriptionStatus
): Promise<BusinessListResponse> {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiClient.get<BusinessListResponse>(`/admin/businesses${query}`);
}

/**
 * Get business detail by ID
 */
export async function getBusinessDetail(
  id: string
): Promise<BusinessDetailResponse> {
  return apiClient.get<BusinessDetailResponse>(`/admin/businesses/${id}`);
}

/**
 * Update subscription for a business
 */
export async function updateSubscription(
  businessId: string,
  request: UpdateSubscriptionRequest
): Promise<UpdateSubscriptionResponse> {
  return apiClient.patch<UpdateSubscriptionResponse>(
    `/admin/businesses/${businessId}/subscription`,
    request
  );
}
