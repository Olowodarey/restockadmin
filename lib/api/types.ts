import {
  User,
  Business,
  Subscription,
  DashboardStats,
  SubscriptionStatus,
  BillingInterval,
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
