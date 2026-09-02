// API-specific type definitions for request/response structures

import type {
  User,
  Business,
  BusinessDetail,
  Subscription,
  SubscriptionStatus,
  BillingInterval,
} from '@/types';

// ============================================================================
// Authentication Types
// ============================================================================

/**
 * Response from the /auth/google endpoint
 */
export interface AuthResponse {
  accessToken: string;
  user: User;
}

/**
 * Request body for Google sign-in
 */
export interface GoogleSignInRequest {
  token: string;
}

// ============================================================================
// Statistics Types
// ============================================================================

/**
 * Response from the /admin/stats endpoint
 */
export interface StatsResponse {
  totalBusinesses: number;
  subscriptionsByStatus: Record<SubscriptionStatus, number>;
}

// ============================================================================
// Business Types
// ============================================================================

/**
 * Query parameters for the /admin/businesses endpoint
 */
export interface BusinessesQuery {
  search?: string;
}

/**
 * Response from the /admin/businesses endpoint
 */
export type BusinessesResponse = Business[];

/**
 * Response from the /admin/businesses/:id endpoint
 */
export type BusinessDetailResponse = BusinessDetail;

// ============================================================================
// Subscription Types
// ============================================================================

/**
 * DTO for updating a subscription via PATCH /admin/businesses/:id/subscription
 */
export interface UpdateSubscriptionDTO {
  status?: SubscriptionStatus;
  billingInterval?: BillingInterval;
  currentPeriodStart?: string; // ISO 8601 date string
  currentPeriodEnd?: string; // ISO 8601 date string
}

/**
 * Response from the subscription update endpoint
 */
export type UpdateSubscriptionResponse = Subscription;

// ============================================================================
// Error Response Types
// ============================================================================

/**
 * Standard error response from the API
 */
export interface APIErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
}

/**
 * Validation error details
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
}
