# Type Definitions and Configuration Usage Guide

This document provides examples of how to use the type definitions and configuration modules created in task 1.2.

## Type Definitions (`types/index.ts`)

### Importing Types and Enums

```typescript
import { 
  UserRole, 
  SubscriptionStatus, 
  BillingInterval,
  User,
  Business,
  Subscription,
  BusinessDetail 
} from '@/types';
```

### Using Enums

```typescript
// Check user role
if (user.role === UserRole.MASTER_ADMIN) {
  // Allow access to admin features
}

// Check subscription status
if (subscription.status === SubscriptionStatus.ACTIVE) {
  // Business has active subscription
}

// Set billing interval
const interval: BillingInterval = BillingInterval.MONTHLY;
```

### Using Type Interfaces

```typescript
// Type-safe user object
const user: User = {
  id: 'user-123',
  email: 'admin@example.com',
  googleId: 'google-oauth-id',
  name: 'Admin User',
  role: UserRole.MASTER_ADMIN,
  businessId: null,
  createdAt: new Date().toISOString(),
};

// Type-safe business object
const business: Business = {
  id: 'biz-123',
  name: 'My Shop',
  phone: '+1234567890',
  address: '123 Main St',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  subscription: {
    status: SubscriptionStatus.ACTIVE,
  },
};
```

## API Types (`lib/api/types.ts`)

### Importing API Types

```typescript
import type {
  AuthResponse,
  StatsResponse,
  UpdateSubscriptionDTO,
  BusinessesQuery,
  APIErrorResponse,
} from '@/lib/api/types';
```

### Using API Response Types

```typescript
// Type-safe API responses
const handleAuthResponse = (response: AuthResponse) => {
  const { accessToken, user } = response;
  // Store token and user
};

const handleStatsResponse = (stats: StatsResponse) => {
  console.log(`Total businesses: ${stats.totalBusinesses}`);
  console.log(`Active subscriptions: ${stats.subscriptionsByStatus.ACTIVE}`);
};
```

### Using DTO Types

```typescript
// Type-safe subscription update
const updateData: UpdateSubscriptionDTO = {
  status: SubscriptionStatus.ACTIVE,
  billingInterval: BillingInterval.YEARLY,
  currentPeriodStart: new Date().toISOString(),
  currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
};

// Query parameters
const query: BusinessesQuery = {
  search: 'coffee shop',
};
```

## Configuration (`lib/config.ts`)

### Loading Configuration

```typescript
import { getConfig, ConfigurationError } from '@/lib/config';

// Get configuration (singleton pattern)
try {
  const config = getConfig();
  
  // Access configuration values
  const apiUrl = config.apiBaseUrl; // e.g., "http://localhost:3000"
  const clientId = config.googleClientId; // Google OAuth client ID
  
} catch (error) {
  if (error instanceof ConfigurationError) {
    // Handle missing or invalid configuration
    console.error('Configuration error:', error.message);
  }
}
```

### Using Configuration in API Client

```typescript
import { getConfig } from '@/lib/config';

// Example API client usage
const config = getConfig();

async function fetchBusinesses() {
  const response = await fetch(`${config.apiBaseUrl}/admin/businesses`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return response.json();
}
```

### Using Configuration in Google OAuth

```typescript
import { GoogleOAuthProvider } from '@react-oauth/google';
import { getConfig } from '@/lib/config';

const config = getConfig();

function App() {
  return (
    <GoogleOAuthProvider clientId={config.googleClientId}>
      {/* Your app components */}
    </GoogleOAuthProvider>
  );
}
```

## Environment Variables

The configuration module requires these environment variables in `.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here
```

## Error Handling

### Configuration Errors

```typescript
import { getConfig, ConfigurationError } from '@/lib/config';

try {
  const config = getConfig();
  // Use config...
} catch (error) {
  if (error instanceof ConfigurationError) {
    // Show error to user or prevent app initialization
    console.error('App configuration is missing or invalid');
    // Display error UI
  }
}
```

### API Error Responses

```typescript
import type { APIErrorResponse } from '@/lib/api/types';

async function makeApiRequest() {
  const response = await fetch('/api/endpoint');
  
  if (!response.ok) {
    const error: APIErrorResponse = await response.json();
    console.error(`API Error (${error.statusCode}): ${error.message}`);
  }
}
```

## Type Safety Benefits

1. **Compile-time validation**: TypeScript catches type errors during development
2. **IDE autocomplete**: Get intelligent suggestions for properties and values
3. **Refactoring safety**: Changes to types are automatically caught throughout the codebase
4. **Documentation**: Types serve as inline documentation for data structures
5. **API contract enforcement**: Ensures frontend matches backend data structures

## Next Steps

These type definitions and configuration will be used by:

- Authentication system (task 2.x)
- API client module (task 3.x)
- Page components (tasks 8.x, 9.x, 11.x, 12.x)
- Custom hooks (task 6.x)
- UI components (task 7.x)
