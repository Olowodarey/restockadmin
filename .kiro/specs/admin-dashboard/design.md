# Design Document: Admin Dashboard

## Overview

The Restock Admin Dashboard is a Next.js App Router application providing master administrators with system-wide management capabilities for businesses and subscriptions. The application implements Google OAuth authentication, role-based access control, and integrates with a NestJS backend API to display statistics, manage businesses, and modify subscription parameters.

## Technology Stack

- **Framework**: Next.js 16.3.4 with App Router
- **UI Library**: React 19.2.8
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication**: Google OAuth 2.0
- **API Communication**: Fetch API with custom wrapper
- **State Management**: React Context for authentication, React hooks for local state
- **Storage**: Browser localStorage for session persistence

## Architecture

### High-Level Architecture

The application follows a layered architecture:

```
┌─────────────────────────────────────────────┐
│         Presentation Layer                  │
│  (Pages & Components - React/Next.js)       │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Application Layer                   │
│  (Auth Context, API Client, Hooks)          │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Infrastructure Layer                │
│  (HTTP Client, Storage, Config)             │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         External Services                   │
│  (Backend API, Google OAuth)                │
└─────────────────────────────────────────────┘
```

### Directory Structure

```
admins/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx              # Login page
│   ├── (dashboard)/
│   │   ├── layout.tsx                # Dashboard layout with navigation
│   │   ├── page.tsx                  # Home page with statistics
│   │   ├── businesses/
│   │   │   ├── page.tsx              # Business list page
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Business detail page
│   │   └── components/
│   │       ├── Navigation.tsx        # Navigation header
│   │       ├── StatsCard.tsx         # Statistics display card
│   │       ├── BusinessTable.tsx     # Business list table
│   │       └── SubscriptionForm.tsx  # Subscription edit form
│   ├── layout.tsx                    # Root layout
│   ├── globals.css                   # Global styles
│   └── providers.tsx                 # Client-side providers wrapper
├── lib/
│   ├── api/
│   │   ├── client.ts                 # API client wrapper
│   │   ├── endpoints.ts              # API endpoint definitions
│   │   └── types.ts                  # API type definitions
│   ├── auth/
│   │   ├── AuthProvider.tsx          # Authentication context provider
│   │   ├── useAuth.ts                # Authentication hook
│   │   ├── storage.ts                # Session storage utilities
│   │   └── google.ts                 # Google OAuth integration
│   ├── hooks/
│   │   ├── useStats.ts               # Statistics data fetching
│   │   ├── useBusinesses.ts          # Business list data fetching
│   │   └── useBusinessDetail.ts      # Business detail data fetching
│   ├── utils/
│   │   ├── errors.ts                 # Error handling utilities
│   │   └── validation.ts             # Validation helpers
│   └── config.ts                     # Application configuration
├── middleware.ts                     # Route protection middleware
└── types/
    └── index.ts                      # Shared type definitions
```

## Core Components

### 1. Authentication System

#### 1.1 AuthProvider Component

The `AuthProvider` manages authentication state and provides authentication methods throughout the application.

**Location**: `lib/auth/AuthProvider.tsx`

**Responsibilities**:

- Initialize authentication state from localStorage on mount
- Provide sign-in functionality via Google OAuth
- Provide sign-out functionality
- Expose authentication state and user profile
- Handle token validation and session expiration

**State Structure**:

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

**Context Interface**:

```typescript
interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (googleToken: string) => Promise<void>;
  signOut: () => void;
}
```

**Implementation Flow**:

1. On mount, attempt to restore session from localStorage
2. Validate restored token (non-empty string check)
3. If invalid, clear storage and set unauthenticated state
4. On sign-in, send Google token to `/auth/google` endpoint
5. Validate user role is `MASTER_ADMIN`
6. Store token and user profile in localStorage
7. Update context state
8. On sign-out, clear localStorage and reset state

#### 1.2 Google OAuth Integration

**Location**: `lib/auth/google.ts`

**Implementation**:

- Use `@react-oauth/google` library for OAuth flow
- Initialize with Google Client ID from environment variables
- Provide `GoogleOAuthProvider` wrapper at root layout
- Expose `useGoogleLogin` hook for sign-in button

**Configuration**:

```typescript
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
```

#### 1.3 Session Storage

**Location**: `lib/auth/storage.ts`

**Storage Keys**:

- `admin_token`: Access token string
- `admin_user`: Serialized user profile object

**Functions**:

```typescript
// Save session to localStorage
function saveSession(token: string, user: User): void;

// Load session from localStorage
function loadSession(): { token: string | null; user: User | null };

// Clear session from localStorage
function clearSession(): void;

// Validate token is present and non-empty
function validateToken(token: string | null): boolean;
```

#### 1.4 Route Protection

**Location**: `middleware.ts`

**Strategy**: Use Next.js middleware to protect routes

**Implementation**:

```typescript
export function middleware(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  const { pathname } = request.nextUrl;

  // Public routes
  if (pathname === "/login") {
    // Redirect authenticated users away from login
    if (token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Protected routes
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/businesses/:path*", "/login"],
};
```

**Note**: Since Next.js middleware doesn't have access to localStorage, we'll also implement client-side guards in the `AuthProvider` that listen to route changes and redirect if session is invalid.

### 2. API Client Module

#### 2.1 API Client Wrapper

**Location**: `lib/api/client.ts`

**Purpose**: Centralized HTTP client with authentication, error handling, and request/response transformation.

**Interface**:

```typescript
class APIClient {
  private baseURL: string;
  private getToken: () => string | null;
  private onUnauthorized: () => void;

  constructor(config: APIClientConfig);

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T>;
  async post<T>(endpoint: string, body?: any): Promise<T>;
  async patch<T>(endpoint: string, body?: any): Promise<T>;
  async delete<T>(endpoint: string): Promise<T>;
}
```

**Request Flow**:

1. Construct URL by combining `baseURL` with endpoint path
2. Get token from provided getter function
3. Add `Authorization: Bearer ${token}` header if token exists
4. Add `Content-Type: application/json` header
5. Execute fetch request
6. Check response status
7. Handle errors (401 → call onUnauthorized callback, others → throw typed error)
8. Parse JSON response
9. Return typed data

**Error Handling**:

```typescript
class APIError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: any,
  ) {
    super(message);
  }
}

// Error handling logic
if (response.status === 401) {
  onUnauthorized();
  throw new APIError(401, "Unauthorized");
}

if (response.status >= 400 && response.status < 500) {
  const error = await response.json();
  throw new APIError(response.status, error.message || "Client error", error);
}

if (response.status >= 500) {
  throw new APIError(response.status, "Server error");
}
```

#### 2.2 API Endpoints

**Location**: `lib/api/endpoints.ts`

**Endpoint Definitions**:

```typescript
export const ENDPOINTS = {
  AUTH: {
    GOOGLE: "/auth/google",
  },
  ADMIN: {
    STATS: "/admin/stats",
    BUSINESSES: "/admin/businesses",
    BUSINESS_DETAIL: (id: string) => `/admin/businesses/${id}`,
    UPDATE_SUBSCRIPTION: (id: string) => `/admin/businesses/${id}/subscription`,
  },
} as const;
```

**Typed API Functions**:

```typescript
// Authentication
export async function signInWithGoogle(
  googleToken: string,
): Promise<AuthResponse>;

// Statistics
export async function getStats(): Promise<StatsResponse>;

// Businesses
export async function getBusinesses(search?: string): Promise<Business[]>;

export async function getBusinessDetail(id: string): Promise<BusinessDetail>;

// Subscriptions
export async function updateSubscription(
  businessId: string,
  data: UpdateSubscriptionDTO,
): Promise<Subscription>;
```

#### 2.3 API Type Definitions

**Location**: `lib/api/types.ts`

**Core Types**:

```typescript
// User types
export enum UserRole {
  MASTER_ADMIN = "MASTER_ADMIN",
  BUSINESS_ADMIN = "BUSINESS_ADMIN",
  STAFF = "STAFF",
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  businessId: string | null;
  createdAt: string;
}

// Subscription types
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

export interface Subscription {
  id: string;
  businessId: string;
  status: SubscriptionStatus;
  billingInterval: BillingInterval;
  currentPeriodStart: string; // ISO 8601
  currentPeriodEnd: string; // ISO 8601
  createdAt: string;
}

// Business types
export interface Business {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  createdAt: string;
  subscription?: {
    status: SubscriptionStatus;
  };
}

export interface BusinessDetail extends Business {
  users: User[];
  subscription: Subscription;
}

// API Response types
export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface StatsResponse {
  totalBusinesses: number;
  subscriptionsByStatus: Record<SubscriptionStatus, number>;
}

// DTO types
export interface UpdateSubscriptionDTO {
  status?: SubscriptionStatus;
  billingInterval?: BillingInterval;
  currentPeriodStart?: string; // ISO 8601
  currentPeriodEnd?: string; // ISO 8601
}
```

### 3. Page Components

#### 3.1 Login Page

**Location**: `app/(auth)/login/page.tsx`

**Purpose**: Unauthenticated entry point for Google OAuth sign-in

**Component Structure**:

```typescript
export default function LoginPage() {
  const { signIn, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated]);

  const handleGoogleSuccess = async (tokenResponse: TokenResponse) => {
    try {
      await signIn(tokenResponse.credential);
      // AuthProvider handles redirect to home
    } catch (error) {
      // Display error message
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h1 className="text-3xl font-bold text-center">Admin Dashboard</h1>
        <p className="text-center text-gray-600">
          Sign in with your master admin account
        </p>
        <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleError} />
      </div>
    </div>
  );
}
```

**Error Handling**:

- Display error message below button for sign-in failures
- Show specific message for role validation failures ("Insufficient permissions")
- Show generic message for other errors ("Sign-in failed")

#### 3.2 Dashboard Layout

**Location**: `app/(dashboard)/layout.tsx`

**Purpose**: Shared layout for authenticated pages with navigation

**Component Structure**:

```typescript
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
```

#### 3.3 Home Page (Dashboard Statistics)

**Location**: `app/(dashboard)/page.tsx`

**Purpose**: Display system-wide statistics

**Component Structure**:

```typescript
export default function HomePage() {
  const { data: stats, error, isLoading } = useStats();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load statistics" />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Total Businesses"
          value={stats.totalBusinesses}
          icon={<BuildingIcon />}
        />
        <StatsCard
          title="Active Subscriptions"
          value={stats.subscriptionsByStatus.ACTIVE}
          icon={<CheckIcon />}
          variant="success"
        />
        <StatsCard
          title="Trialing"
          value={stats.subscriptionsByStatus.TRIALING}
          icon={<ClockIcon />}
          variant="info"
        />
        <StatsCard
          title="Past Due"
          value={stats.subscriptionsByStatus.PAST_DUE}
          icon={<WarningIcon />}
          variant="warning"
        />
        <StatsCard
          title="Suspended"
          value={stats.subscriptionsByStatus.SUSPENDED}
          icon={<PauseIcon />}
          variant="error"
        />
        <StatsCard
          title="Canceled"
          value={stats.subscriptionsByStatus.CANCELED}
          icon={<XIcon />}
          variant="gray"
        />
      </div>
    </div>
  );
}
```

**Data Fetching**: Use `useStats` custom hook

#### 3.4 Business List Page

**Location**: `app/(dashboard)/businesses/page.tsx`

**Purpose**: Display searchable list of all businesses

**Component Structure**:

```typescript
export default function BusinessesPage() {
  const [search, setSearch] = useState('');
  const { data: businesses, error, isLoading } = useBusinesses(search);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    // Search is reactive via useBusinesses dependency
  };

  const handleClear = () => {
    setSearch('');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load businesses" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Businesses</h1>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search businesses..."
            className="px-4 py-2 border rounded-lg"
          />
          {search && (
            <button type="button" onClick={handleClear}>
              Clear
            </button>
          )}
        </form>
      </div>

      <BusinessTable businesses={businesses} />
    </div>
  );
}
```

**Data Fetching**: Use `useBusinesses` custom hook with search parameter

#### 3.5 Business Detail Page

**Location**: `app/(dashboard)/businesses/[id]/page.tsx`

**Purpose**: Display detailed business information with users and subscription

**Component Structure**:

```typescript
export default function BusinessDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: business, error, isLoading, mutate } = useBusinessDetail(params.id);
  const [isEditingSubscription, setIsEditingSubscription] = useState(false);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    if (error.status === 404) {
      return <ErrorMessage message="Business not found" />;
    }
    return <ErrorMessage message="Failed to load business details" />;
  }

  const handleSubscriptionUpdate = async (data: UpdateSubscriptionDTO) => {
    try {
      const updated = await updateSubscription(params.id, data);
      mutate({ ...business, subscription: updated });
      setIsEditingSubscription(false);
      // Show success toast
    } catch (error) {
      // Show error message
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{business.name}</h1>
        <Link href="/businesses">
          <button>← Back to Businesses</button>
        </Link>
      </div>

      {/* Business Information Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Business Information</h2>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-gray-600">Phone</dt>
            <dd>{business.phone || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-gray-600">Address</dt>
            <dd>{business.address || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-gray-600">Created</dt>
            <dd>{formatDate(business.createdAt)}</dd>
          </div>
        </dl>
      </div>

      {/* Users Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Users</h2>
        <table className="min-w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {business.users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td><RoleBadge role={user.role} /></td>
                <td>{formatDate(user.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Subscription Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Subscription</h2>
          <button onClick={() => setIsEditingSubscription(true)}>
            Edit
          </button>
        </div>

        {isEditingSubscription ? (
          <SubscriptionForm
            subscription={business.subscription}
            onSubmit={handleSubscriptionUpdate}
            onCancel={() => setIsEditingSubscription(false)}
          />
        ) : (
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-gray-600">Status</dt>
              <dd><StatusBadge status={business.subscription.status} /></dd>
            </div>
            <div>
              <dt className="text-gray-600">Billing Interval</dt>
              <dd>{business.subscription.billingInterval}</dd>
            </div>
            <div>
              <dt className="text-gray-600">Current Period Start</dt>
              <dd>{formatDate(business.subscription.currentPeriodStart)}</dd>
            </div>
            <div>
              <dt className="text-gray-600">Current Period End</dt>
              <dd>{formatDate(business.subscription.currentPeriodEnd)}</dd>
            </div>
            <div>
              <dt className="text-gray-600">Created</dt>
              <dd>{formatDate(business.subscription.createdAt)}</dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}
```

**Data Fetching**: Use `useBusinessDetail` custom hook with business ID

### 4. Shared Components

#### 4.1 Navigation Component

**Location**: `app/(dashboard)/components/Navigation.tsx`

**Purpose**: Global navigation header for authenticated pages

**Component Structure**:

```typescript
export function Navigation() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    signOut();
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold">
              Admin Dashboard
            </Link>
            <Link
              href="/"
              className="text-gray-700 hover:text-gray-900"
            >
              Home
            </Link>
            <Link
              href="/businesses"
              className="text-gray-700 hover:text-gray-900"
            >
              Businesses
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-gray-700">{user?.name}</span>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
```

**Responsive Behavior**:

- On screens < 768px, collapse navigation links into hamburger menu
- Maintain minimum 44px touch target size for mobile

#### 4.2 StatsCard Component

**Location**: `app/(dashboard)/components/StatsCard.tsx`

**Purpose**: Display individual statistics with icon and styling

**Props Interface**:

```typescript
interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  variant?: "default" | "success" | "info" | "warning" | "error" | "gray";
}
```

**Component Structure**:

```typescript
export function StatsCard({ title, value, icon, variant = 'default' }: StatsCardProps) {
  const variantStyles = {
    default: 'bg-white border-gray-200',
    success: 'bg-green-50 border-green-200',
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-yellow-50 border-yellow-200',
    error: 'bg-red-50 border-red-200',
    gray: 'bg-gray-50 border-gray-300',
  };

  return (
    <div className={`rounded-lg border p-6 ${variantStyles[variant]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-gray-400">{icon}</div>
      </div>
    </div>
  );
}
```

#### 4.3 BusinessTable Component

**Location**: `app/(dashboard)/components/BusinessTable.tsx`

**Purpose**: Display businesses in sortable table format

**Props Interface**:

```typescript
interface BusinessTableProps {
  businesses: Business[];
}
```

**Component Structure**:

```typescript
export function BusinessTable({ businesses }: BusinessTableProps) {
  const router = useRouter();

  // Businesses are already sorted by backend, but ensure descending order
  const sortedBusinesses = useMemo(() => {
    return [...businesses].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [businesses]);

  const handleRowClick = (businessId: string) => {
    router.push(`/businesses/${businessId}`);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Business Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Subscription Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedBusinesses.map((business) => (
            <tr
              key={business.id}
              onClick={() => handleRowClick(business.id)}
              className="hover:bg-gray-50 cursor-pointer"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {business.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(business.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={business.subscription?.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {sortedBusinesses.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No businesses found
        </div>
      )}
    </div>
  );
}
```

#### 4.4 SubscriptionForm Component

**Location**: `app/(dashboard)/components/SubscriptionForm.tsx`

**Purpose**: Edit subscription parameters

**Props Interface**:

```typescript
interface SubscriptionFormProps {
  subscription: Subscription;
  onSubmit: (data: UpdateSubscriptionDTO) => Promise<void>;
  onCancel: () => void;
}
```

**Component Structure**:

```typescript
export function SubscriptionForm({ subscription, onSubmit, onCancel }: SubscriptionFormProps) {
  const [formData, setFormData] = useState({
    status: subscription.status,
    billingInterval: subscription.billingInterval,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Format dates as ISO 8601
      const data: UpdateSubscriptionDTO = {
        status: formData.status,
        billingInterval: formData.billingInterval,
        currentPeriodStart: new Date(formData.currentPeriodStart).toISOString(),
        currentPeriodEnd: new Date(formData.currentPeriodEnd).toISOString(),
      };

      await onSubmit(data);
    } catch (err) {
      if (err instanceof APIError) {
        if (err.status === 400) {
          setError(err.details?.message || 'Validation failed');
        } else if (err.status === 404) {
          setError('Subscription not found');
        } else {
          setError('Failed to update subscription');
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as SubscriptionStatus })}
          className="w-full px-3 py-2 border rounded-lg"
          disabled={isSubmitting}
        >
          <option value={SubscriptionStatus.TRIALING}>Trialing</option>
          <option value={SubscriptionStatus.ACTIVE}>Active</option>
          <option value={SubscriptionStatus.PAST_DUE}>Past Due</option>
          <option value={SubscriptionStatus.SUSPENDED}>Suspended</option>
          <option value={SubscriptionStatus.CANCELED}>Canceled</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Billing Interval
        </label>
        <select
          value={formData.billingInterval}
          onChange={(e) => setFormData({ ...formData, billingInterval: e.target.value as BillingInterval })}
          className="w-full px-3 py-2 border rounded-lg"
          disabled={isSubmitting}
        >
          <option value={BillingInterval.MONTHLY}>Monthly</option>
          <option value={BillingInterval.YEARLY}>Yearly</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Current Period Start
        </label>
        <input
          type="datetime-local"
          value={formData.currentPeriodStart.slice(0, 16)}
          onChange={(e) => setFormData({ ...formData, currentPeriodStart: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Current Period End
        </label>
        <input
          type="datetime-local"
          value={formData.currentPeriodEnd.slice(0, 16)}
          onChange={(e) => setFormData({ ...formData, currentPeriodEnd: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 min-h-[44px]"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50 min-h-[44px]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
```

### 5. Custom Hooks for Data Fetching

#### 5.1 useStats Hook

**Location**: `lib/hooks/useStats.ts`

**Purpose**: Fetch and manage dashboard statistics

**Implementation**:

```typescript
export function useStats() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [error, setError] = useState<APIError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchStats() {
      try {
        setIsLoading(true);
        const stats = await getStats();
        if (mounted) {
          setData(stats);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err as APIError);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchStats();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, error, isLoading };
}
```

#### 5.2 useBusinesses Hook

**Location**: `lib/hooks/useBusinesses.ts`

**Purpose**: Fetch and manage business list with search

**Implementation**:

```typescript
export function useBusinesses(search?: string) {
  const [data, setData] = useState<Business[]>([]);
  const [error, setError] = useState<APIError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchBusinesses() {
      try {
        setIsLoading(true);
        const businesses = await getBusinesses(search);
        if (mounted) {
          setData(businesses);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err as APIError);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchBusinesses();

    return () => {
      mounted = false;
    };
  }, [search]);

  return { data, error, isLoading };
}
```

#### 5.3 useBusinessDetail Hook

**Location**: `lib/hooks/useBusinessDetail.ts`

**Purpose**: Fetch and manage single business detail with mutation support

**Implementation**:

```typescript
export function useBusinessDetail(id: string) {
  const [data, setData] = useState<BusinessDetail | null>(null);
  const [error, setError] = useState<APIError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBusiness = useCallback(async () => {
    try {
      setIsLoading(true);
      const business = await getBusinessDetail(id);
      setData(business);
      setError(null);
    } catch (err) {
      setError(err as APIError);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBusiness();
  }, [fetchBusiness]);

  // Optimistic update function
  const mutate = useCallback((updatedData: BusinessDetail) => {
    setData(updatedData);
  }, []);

  return { data, error, isLoading, mutate, refetch: fetchBusiness };
}
```

## Data Flow Patterns

### Authentication Flow

```
User → Google OAuth → Google Token
                         ↓
                   AuthProvider.signIn()
                         ↓
               POST /auth/google
                         ↓
            Backend validates token
                         ↓
         Returns { accessToken, user }
                         ↓
           Validate user.role === MASTER_ADMIN
                         ↓
         Store in localStorage + Context
                         ↓
              Redirect to home page
```

### Data Fetching Flow

```
Component Mount
      ↓
  useHook() called
      ↓
  API client request
      ↓
  Add auth header
      ↓
  Fetch from backend
      ↓
  Response handler
      ↓
  Error? → Handle based on status
  Success? → Update state
      ↓
  Component re-renders
```

### Error Handling Flow

```
API Request Fails
      ↓
Check error.status
      ↓
401? → clearSession() → redirect('/login')
404? → Show "Not Found" message
400? → Show validation errors
5xx? → Show "Server Error"
Network? → Show "Connection Error"
      ↓
Log to console
```

## Error Handling Strategy

### Error Categories

1. **Authentication Errors (401)**
   - Clear session storage
   - Update auth context state
   - Redirect to login page
   - Handled globally by API client

2. **Validation Errors (400)**
   - Extract error messages from response body
   - Display field-specific errors
   - Allow user to correct and retry

3. **Not Found Errors (404)**
   - Display contextual "not found" message
   - Provide navigation back to list views

4. **Server Errors (5xx)**
   - Display generic "Server error, please try again" message
   - Log full error details to console

5. **Network Errors**
   - Display "Connection error, please check your network" message
   - Provide retry mechanism

### Error Display Components

**ErrorMessage Component**:

```typescript
interface ErrorMessageProps {
  message: string;
  retry?: () => void;
}

export function ErrorMessage({ message, retry }: ErrorMessageProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <p className="text-red-700 mb-4">{message}</p>
      {retry && (
        <button onClick={retry} className="text-red-600 hover:text-red-800">
          Try Again
        </button>
      )}
    </div>
  );
}
```

## Configuration

### Environment Variables

**Required Variables**:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

**Configuration File** (`lib/config.ts`):

```typescript
function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  apiBaseUrl: getEnvVar("NEXT_PUBLIC_API_BASE_URL"),
  googleClientId: getEnvVar("NEXT_PUBLIC_GOOGLE_CLIENT_ID"),
} as const;
```

## Responsive Design

### Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1023px
- **Desktop**: ≥ 1024px

### Mobile Adaptations

1. **Navigation**: Hamburger menu for mobile
2. **Tables**: Horizontal scroll or card layout
3. **Forms**: Single column layout
4. **Stats Grid**: 1 column on mobile, 2 on tablet, 3 on desktop
5. **Touch Targets**: Minimum 44px × 44px for all interactive elements

### Tailwind Responsive Classes

```css
/* Mobile first approach */
.stats-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.button {
  @apply min-h-[44px] min-w-[44px] px-4 py-2;
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: API Client Authentication

_For any_ API request made by the API client, the request SHALL include the current access token in the Authorization header as a Bearer token if a token is available.

**Validates: Requirements 5.2, 6.2, 8.2, 9.8**

### Property 2: Google Token Transmission

_For any_ valid Google ID token received after OAuth sign-in, the Admin Dashboard SHALL send that token to the Backend API POST /auth/google endpoint.

**Validates: Requirements 1.5**

### Property 3: Session Storage Persistence

_For any_ successful authentication response containing an access token and user object, the Admin Dashboard SHALL persist both the token and user profile to browser localStorage.

**Validates: Requirements 1.6, 3.1, 3.2**

### Property 4: Role-Based Access Rejection

_For any_ user object with a role value other than MASTER_ADMIN, the Admin Dashboard SHALL reject the sign-in attempt and prevent session establishment.

**Validates: Requirements 2.1**

### Property 5: Session Token Validation

_For any_ token value retrieved from storage, the validation logic SHALL accept non-empty strings as valid and reject null, undefined, or empty strings as invalid.

**Validates: Requirements 3.4**

### Property 6: Sign-Out Session Clearing

_For any_ session state stored in browser localStorage, invoking sign-out SHALL completely remove both the token and user profile from storage.

**Validates: Requirements 3.6**

### Property 7: Route Protection

_For any_ protected route in the application, accessing that route without a valid session SHALL redirect to the login page, and accessing with a valid session SHALL render the requested page.

**Validates: Requirements 4.1, 4.5**

### Property 8: Statistics Display

_For any_ successful response from the Stats endpoint, the Admin Dashboard SHALL display the total business count and all five subscription status counts (TRIALING, ACTIVE, PAST_DUE, SUSPENDED, CANCELED).

**Validates: Requirements 5.3, 5.4, 5.5**

### Property 9: Business List Rendering

_For any_ business array returned by the Businesses endpoint, the Admin Dashboard SHALL display each business with its name, creation date, and subscription status.

**Validates: Requirements 6.3**

### Property 10: Business List Sorting

_For any_ unsorted business array returned by the Businesses endpoint, the Admin Dashboard SHALL sort and display businesses by creation date in descending order.

**Validates: Requirements 6.4**

### Property 11: Business Navigation

_For any_ business ID in the displayed business list, clicking that business SHALL navigate to the business detail page with the correct ID in the route.

**Validates: Requirements 6.5**

### Property 12: Search Term Capture

_For any_ text entered in the search input field, the Admin Dashboard SHALL capture and store that search term for subsequent API requests.

**Validates: Requirements 7.2**

### Property 13: Search Query Transmission

_For any_ search term submitted by the user, the Admin Dashboard SHALL send that term as a query parameter to the Businesses endpoint.

**Validates: Requirements 7.3**

### Property 14: Business Detail API Call

_For any_ business ID in the route parameter, loading the business detail page SHALL request business details from the correct endpoint constructed with that ID.

**Validates: Requirements 8.1**

### Property 15: Business Detail Display

_For any_ business detail object returned by the Backend API, the Admin Dashboard SHALL display all required business fields (name, phone, address, creation date), all user fields (email, name, role, creation date), and all subscription fields (status, billing interval, period dates, creation date).

**Validates: Requirements 8.3, 8.4, 8.5**

### Property 16: Subscription Form Pre-population

_For any_ subscription object passed to the edit form, the form SHALL pre-populate all fields with the current subscription values.

**Validates: Requirements 9.3**

### Property 17: Subscription Form Submission

_For any_ modified subscription form values submitted by the user, the Admin Dashboard SHALL send those values to the Update Subscription endpoint with dates formatted as ISO 8601 strings.

**Validates: Requirements 9.7, 9.9**

### Property 18: Subscription Display Update

_For any_ successful update response from the Backend API, the Admin Dashboard SHALL update the displayed subscription data with the response data.

**Validates: Requirements 9.10**

### Property 19: Validation Error Display

_For any_ 400 Bad Request response from the Update Subscription endpoint containing validation errors, the Admin Dashboard SHALL extract and display the validation error messages.

**Validates: Requirements 9.14**

### Property 20: Universal 401 Handling

_For any_ Backend API endpoint that returns a 401 Unauthorized response, the Admin Dashboard SHALL invalidate the session, clear localStorage, and redirect to the login page.

**Validates: Requirements 5.6, 6.6, 8.7, 9.15, 10.1, 10.2, 10.3**

### Property 21: Non-401 Error Message Display

_For any_ API request that returns a non-401 error response, the Admin Dashboard SHALL display an appropriate error message based on the error status (404 → "Not Found", 400 → validation details, 5xx → "Server Error", others → contextual message).

**Validates: Requirements 1.9, 5.7, 6.7, 8.8, 9.16, 10.4, 10.5**

### Property 22: API Error Logging

_For any_ API error encountered during requests, the Admin Dashboard SHALL log the error details to the browser console.

**Validates: Requirements 10.7**

### Property 23: API URL Construction

_For any_ endpoint path used in API requests, the Admin Dashboard SHALL construct the full URL by correctly combining the configured base URL with the endpoint path.

**Validates: Requirements 11.3**

### Property 24: Navigation Header Display

_For any_ authenticated page in the application, the Admin Dashboard SHALL display the navigation header with home link, business list link, user name, and sign-out button.

**Validates: Requirements 12.1, 12.2, 12.3**

### Property 25: User Name Display in Header

_For any_ authenticated user with a name value, the navigation header SHALL display that user's name.

**Validates: Requirements 12.3**

### Property 26: Responsive Layout Adaptation

_For any_ screen width between 768 pixels and 1920 pixels, the Admin Dashboard SHALL render with a layout that adapts appropriately to that width.

**Validates: Requirements 12.4**

### Property 27: Minimum Touch Target Size

_For any_ interactive element (buttons, links, form inputs) in the Admin Dashboard, that element SHALL have a minimum touch target size of 44 pixels by 44 pixels.

**Validates: Requirements 12.6**

## Testing Strategy

### Unit Tests

Unit tests will verify specific examples, edge cases, and error conditions:

- **Authentication edge cases**: Empty tokens, null values, missing role
- **Form validation**: Invalid date ranges, missing required fields
- **Error display**: Specific error messages for each status code
- **Component rendering**: Presence of required UI elements
- **Date formatting**: ISO 8601 conversion correctness

### Property-Based Tests

Property-based tests will verify universal properties across randomized inputs (minimum 100 iterations per property):

- **API client**: Auth header inclusion, URL construction, error handling
- **Session management**: Storage, retrieval, validation, clearing
- **Role validation**: Rejection of non-master-admin roles
- **Display logic**: Rendering various data structures correctly
- **Navigation**: Route protection and navigation with various paths/IDs
- **Search**: Handling various search term formats
- **Form submission**: Handling various input values and date formats
- **Error handling**: Consistent behavior across error status codes
- **Responsive design**: Layout adaptation across screen sizes

Each property test will be tagged with:

```typescript
/**
 * Feature: admin-dashboard, Property {number}: {property_text}
 */
```

### Integration Tests

Integration tests will verify external service behavior:

- Google OAuth flow (mocked)
- Backend API endpoints (mocked)
- Search filtering (backend responsibility)

### Smoke Tests

Smoke tests will verify one-time configuration and initialization:

- Environment variables loaded correctly
- Routes configured correctly
- Google OAuth initialized with correct client ID

## Implementation Notes

### Next.js App Router Considerations

1. **Server Components**: Use server components for static layouts and navigation
2. **Client Components**: Mark components using hooks with `'use client'` directive
3. **Loading States**: Use `loading.tsx` files for automatic loading UI
4. **Error Boundaries**: Use `error.tsx` files for error handling

### State Management

- **Authentication**: React Context (global)
- **Data Fetching**: Custom hooks with local state (page-level)
- **Forms**: Controlled components with local state (component-level)

### Performance Considerations

1. **Code Splitting**: Leverage Next.js automatic code splitting
2. **Image Optimization**: Use Next.js `Image` component for any images
3. **Memoization**: Use `useMemo` for expensive computations (e.g., sorting)
4. **Debouncing**: Debounce search input (300ms delay)

### Accessibility

1. **Semantic HTML**: Use proper heading hierarchy, semantic elements
2. **ARIA Labels**: Add labels to interactive elements
3. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
4. **Focus Management**: Manage focus on navigation and modal interactions
5. **Color Contrast**: Ensure WCAG AA compliance for text contrast ratios

## Security Considerations

1. **XSS Prevention**: React's built-in escaping handles most cases
2. **Token Storage**: localStorage is acceptable for this admin-only application
3. **HTTPS**: Production deployment must use HTTPS
4. **Token Expiration**: Rely on backend token expiration and 401 responses
5. **CORS**: Backend must configure CORS to allow dashboard domain

## Deployment

### Build Command

```bash
npm run build
```

### Environment Variables (Production)

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.restock.example.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=production-client-id.apps.googleusercontent.com
```

### Static Export

Since this is an admin dashboard with authenticated routes, we'll use standard Next.js SSR deployment, not static export.

## Future Enhancements

1. **Search Enhancements**: Advanced filtering by subscription status, date ranges
2. **Bulk Actions**: Select multiple businesses for bulk operations
3. **Export Functionality**: Export business and subscription data to CSV
4. **Audit Logs**: Display history of subscription changes
5. **Email Notifications**: Configure email alerts for subscription events
6. **User Management**: Create/edit/delete users within businesses
7. **Dashboard Widgets**: Customizable dashboard with draggable widgets
8. **Real-time Updates**: WebSocket integration for live statistics updates
