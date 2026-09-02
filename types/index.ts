// Shared TypeScript type definitions for the Admin Dashboard

// ============================================================================
// User Types
// ============================================================================

/**
 * User roles in the system
 * MASTER_ADMIN: System-wide administrator with access to all businesses
 * OWNER: Business owner with access to their own business
 */
export enum UserRole {
  MASTER_ADMIN = 'MASTER_ADMIN',
  OWNER = 'OWNER',
}

/**
 * User entity representing an authenticated account
 */
export interface User {
  id: string;
  email: string;
  googleId: string;
  name: string;
  role: UserRole;
  businessId: string | null;
  createdAt: string; // ISO 8601 date string
}

// ============================================================================
// Subscription Types
// ============================================================================

/**
 * Subscription status enumeration
 */
export enum SubscriptionStatus {
  TRIALING = 'TRIALING',
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  SUSPENDED = 'SUSPENDED',
  CANCELED = 'CANCELED',
}

/**
 * Billing interval enumeration
 */
export enum BillingInterval {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

/**
 * Subscription entity representing a business's subscription
 */
export interface Subscription {
  id: string;
  businessId: string;
  status: SubscriptionStatus;
  billingInterval: BillingInterval;
  currentPeriodStart: string | null; // ISO 8601 date string
  currentPeriodEnd: string | null; // ISO 8601 date string
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
}

// ============================================================================
// Business Types
// ============================================================================

/**
 * Business entity representing a shop/tenant
 */
export interface Business {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  subscription?: {
    status: SubscriptionStatus;
  };
}

/**
 * Detailed business entity with associated users and subscription
 */
export interface BusinessDetail extends Omit<Business, 'subscription'> {
  users: User[];
  subscription: Subscription;
}
