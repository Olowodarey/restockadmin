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
 * Get list of businesses with optional search
 */
export async function getBusinesses(
  search?: string
): Promise<BusinessListResponse> {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
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
