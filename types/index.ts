// Enumerations
export enum UserRole {
  MASTER_ADMIN = "MASTER_ADMIN",
  OWNER = "OWNER",
}

export enum SubscriptionStatus {
  TRIALING = "TRIALING",
  ACTIVE = "ACTIVE",
  PAST_DUE = "PAST_DUE",
  SUSPENDED = "SUSPENDED",
  CANCELED = "CANCELED",
}

export enum BillingInterval {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

// User entity — no businessId here: an owner can hold membership in more
// than one Business now, via BusinessMembership below, so "which business"
// is never a single field on the user itself.
export interface User {
  id: string;
  email: string;
  googleId: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

// Account-wide entitlement caps — replaced the old "any business ACTIVE =
// unlimited shops/staff" rule. Set per account by a master admin after the
// owner pays for a specific plan (e.g. "paid for 2 staff" -> maxStaff: 2).
export interface UserEntitlements {
  id: string;
  email: string;
  name: string;
  maxShops: number;
  maxStaff: number;
}

// Join row between a Business and a User — mirrors the backend's
// BusinessMembership entity. A Business's owner(s) are reached via
// business.memberships[].user, not a direct business.users array (the
// backend dropped that direct relation when multi-business support landed).
export interface BusinessMembership {
  id: string;
  businessId: string;
  userId: string;
  user: User;
  role: string;
  createdAt: string;
}

// Business entity
export interface Business {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
  memberships: BusinessMembership[];
  subscription: Subscription;
}

// Subscription entity
export interface Subscription {
  id: string;
  businessId: string;
  status: SubscriptionStatus;
  billingInterval: BillingInterval;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  createdAt: string;
  updatedAt: string;
}

// Session data stored in browser
export interface Session {
  accessToken: string;
  user: User;
}

// Dashboard statistics
export interface DashboardStats {
  totalBusinesses: number;
  byStatus: Record<SubscriptionStatus, number>;
}
