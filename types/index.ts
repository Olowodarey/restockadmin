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

// User entity
export interface User {
  id: string;
  email: string;
  googleId: string;
  name: string;
  role: UserRole;
  businessId: string | null;
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
  users: User[];
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
