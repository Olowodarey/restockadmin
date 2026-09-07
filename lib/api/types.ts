import {
  User,
  Business,
  Subscription,
  DashboardStats,
  SubscriptionStatus,
  BillingInterval,
  UserEntitlements,
} from "@/types";

// Auth API request/response types
export interface SignInRequest {
  idToken: string;
  businessName?: string;
}

export interface SignInResponse {
  accessToken: string;
  user: User;
}

export interface ErrorResponse {
  message: string;
  error: string;
  statusCode: number;
}

// Admin stats API response
export type StatsResponse = DashboardStats;

// Business list API response
export type BusinessListResponse = Business[];

// Business detail API response
export type BusinessDetailResponse = Business;

// Subscription update request
export interface UpdateSubscriptionRequest {
  status?: SubscriptionStatus;
  billingInterval?: BillingInterval;
  currentPeriodStart?: string; // ISO 8601
  currentPeriodEnd?: string; // ISO 8601
}

// Subscription update response
export type UpdateSubscriptionResponse = Subscription;

// Global app settings (operator-controlled). Currently just the default
// free-trial length applied to new signups.
export interface AppSettings {
  trialDays: number;
}

export type SettingsResponse = AppSettings;

export interface UpdateSettingsRequest {
  trialDays?: number;
}

// Entitlements API
export type UserEntitlementsResponse = UserEntitlements;

export interface UpdateEntitlementsRequest {
  maxShops?: number;
  maxStaff?: number;
}

// "See his shops" / "Add a shop for him"
export type UserBusinessesResponse = Business[];

export interface CreateBusinessForUserRequest {
  name: string;
}

export type CreateBusinessForUserResponse = Business;
