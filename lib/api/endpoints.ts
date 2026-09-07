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
  SettingsResponse,
  UpdateSettingsRequest,
  UserEntitlementsResponse,
  UpdateEntitlementsRequest,
  UserBusinessesResponse,
  CreateBusinessForUserRequest,
  CreateBusinessForUserResponse,
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

/**
 * Get global app settings (currently the default free-trial length).
 */
export async function getSettings(): Promise<SettingsResponse> {
  return apiClient.get<SettingsResponse>("/admin/settings");
}

/**
 * Update global app settings.
 */
export async function updateSettings(
  request: UpdateSettingsRequest
): Promise<SettingsResponse> {
  return apiClient.patch<SettingsResponse>("/admin/settings", request);
}

/**
 * Get one owner's account-wide entitlement caps (maxShops/maxStaff).
 */
export async function getUserEntitlements(
  userId: string
): Promise<UserEntitlementsResponse> {
  return apiClient.get<UserEntitlementsResponse>(
    `/admin/users/${userId}/entitlements`
  );
}

/**
 * Set an owner's entitlement caps — what they're allowed, independent of
 * subscription status. Call after confirming payment for a specific plan.
 */
export async function updateEntitlements(
  userId: string,
  request: UpdateEntitlementsRequest
): Promise<UserEntitlementsResponse> {
  return apiClient.patch<UserEntitlementsResponse>(
    `/admin/users/${userId}/entitlements`,
    request
  );
}

/**
 * "See his shops" — every business a given owner manages.
 */
export async function getUserBusinesses(
  userId: string
): Promise<UserBusinessesResponse> {
  return apiClient.get<UserBusinessesResponse>(
    `/admin/users/${userId}/businesses`
  );
}

/**
 * "Add a shop for him" — admin-initiated, bypasses the owner's own
 * self-serve maxShops check.
 */
export async function createBusinessForUser(
  userId: string,
  request: CreateBusinessForUserRequest
): Promise<CreateBusinessForUserResponse> {
  return apiClient.post<CreateBusinessForUserResponse>(
    `/admin/users/${userId}/businesses`,
    request
  );
}
