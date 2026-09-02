# Implementation Plan: Admin Dashboard

## Overview

This implementation plan converts the Admin Dashboard design into actionable coding tasks. The dashboard is built with Next.js 16.3.4 App Router, React 19, TypeScript, and Tailwind CSS 4. It provides master administrators with Google OAuth authentication, system-wide statistics, business management, and subscription editing capabilities.

## Tasks

- [x] 1. Project setup and configuration
  - [x] 1.1 Install dependencies and configure environment
    - Install `@react-oauth/google` package for Google OAuth integration
    - Create `.env.local` file with `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
    - Update `.env.local.example` with required environment variables
    - _Requirements: 11.1, 11.2, 11.4_
  - [x] 1.2 Create type definitions and configuration
    - Create `types/index.ts` with all shared TypeScript interfaces (User, Business, Subscription, enums)
    - Create `lib/config.ts` to load and validate environment variables
    - Create `lib/api/types.ts` with API-specific type definitions
    - _Requirements: 11.1, 11.2, 11.5_

- [x] 2. Implement authentication system
  - [x] 2.1 Create session storage utilities
    - Create `lib/auth/storage.ts` with functions for saveSession, loadSession, clearSession, validateToken
    - Implement localStorage operations for `admin_token` and `admin_user` keys
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6_
  - [x] 2.2 Implement Google OAuth integration
    - Create `lib/auth/google.ts` to export Google client configuration
    - Configure GoogleOAuthProvider wrapper with client ID from environment
    - _Requirements: 1.2, 1.3, 11.4_
  - [x] 2.3 Create AuthProvider context
    - Create `lib/auth/AuthProvider.tsx` with authentication state management
    - Implement signIn function that sends Google token to backend `/auth/google`
    - Validate user role is MASTER_ADMIN before storing session
    - Implement signOut function that clears storage and redirects
    - Restore session from localStorage on mount
    - _Requirements: 1.4, 1.5, 1.6, 1.7, 2.1, 2.2, 2.3, 3.3, 3.4, 3.6, 3.7_
  - [x] 2.4 Create useAuth hook
    - Create `lib/auth/useAuth.ts` that exports authentication context
    - Export hook to access user, token, isAuthenticated, isLoading, signIn, signOut
    - _Requirements: 1.6, 3.6_
  - [ ]\* 2.5 Write property test for session storage
    - **Property 3: Session Storage Persistence**
    - **Validates: Requirements 1.6, 3.1, 3.2**
  - [ ]\* 2.6 Write property test for role-based access
    - **Property 4: Role-Based Access Rejection**
    - **Validates: Requirements 2.1**
  - [ ]\* 2.7 Write property test for token validation
    - **Property 5: Session Token Validation**
    - **Validates: Requirements 3.4**
  - [ ]\* 2.8 Write property test for session clearing
    - **Property 6: Sign-Out Session Clearing**
    - **Validates: Requirements 3.6**

- [x] 3. Implement API client module
  - [x] 3.1 Create API client wrapper
    - Create `lib/api/client.ts` with APIClient class
    - Implement get, post, patch, delete methods with auth header injection
    - Handle response parsing and error transformation
    - Call onUnauthorized callback for 401 responses
    - _Requirements: 5.2, 6.2, 8.2, 9.8, 10.1, 10.2, 10.3, 10.7_
  - [x] 3.2 Create API endpoint definitions
    - Create `lib/api/endpoints.ts` with endpoint path constants
    - Create typed API functions for each endpoint (signInWithGoogle, getStats, getBusinesses, getBusinessDetail, updateSubscription)
    - _Requirements: 1.5, 5.1, 6.1, 8.1, 9.7_
  - [ ]\* 3.3 Write property test for API authentication
    - **Property 1: API Client Authentication**
    - **Validates: Requirements 5.2, 6.2, 8.2, 9.8**
  - [ ]\* 3.4 Write property test for URL construction
    - **Property 23: API URL Construction**
    - **Validates: Requirements 11.3**
  - [ ]\* 3.5 Write property test for universal 401 handling
    - **Property 20: Universal 401 Handling**
    - **Validates: Requirements 5.6, 6.6, 8.7, 9.15, 10.1, 10.2, 10.3**

- [x] 4. Create providers and root layout
  - [x] 4.1 Create providers wrapper
    - Create `app/providers.tsx` with client component wrapping GoogleOAuthProvider and AuthProvider
    - _Requirements: 1.2, 1.3_
  - [x] 4.2 Update root layout
    - Update `app/layout.tsx` to wrap children with Providers component
    - _Requirements: 1.2_

- [x] 5. Implement route protection
  - [x] 5.1 Create middleware for route protection
    - Create `middleware.ts` with route protection logic
    - Protect home, businesses, and business detail routes
    - Redirect unauthenticated users to login
    - Redirect authenticated users away from login
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  - [x] 5.2 Add client-side auth guards to dashboard layout
    - Implement redirect logic in dashboard layout for invalid sessions
    - _Requirements: 4.1, 4.5_
  - [ ]\* 5.3 Write property test for route protection
    - **Property 7: Route Protection**
    - **Validates: Requirements 4.1, 4.5**

- [x] 6. Create custom data fetching hooks
  - [x] 6.1 Create useStats hook
    - Create `lib/hooks/useStats.ts` to fetch dashboard statistics
    - Implement loading and error state management
    - Call getStats API function
    - _Requirements: 5.1, 5.2, 5.8_
  - [x] 6.2 Create useBusinesses hook
    - Create `lib/hooks/useBusinesses.ts` with search parameter support
    - Implement loading and error state management
    - Call getBusinesses API function with search query
    - _Requirements: 6.1, 6.2, 7.3, 7.5_
  - [x] 6.3 Create useBusinessDetail hook
    - Create `lib/hooks/useBusinessDetail.ts` with business ID parameter
    - Implement loading and error state management
    - Provide mutate function for optimistic updates
    - Call getBusinessDetail API function
    - _Requirements: 8.1, 8.2, 8.9_

- [x] 7. Implement shared UI components
  - [x] 7.1 Create error display components
    - Create ErrorMessage component in `app/(dashboard)/components/ErrorMessage.tsx`
    - Include optional retry button
    - _Requirements: 1.8, 1.9, 2.2, 5.7, 6.7, 8.6, 8.8, 9.16_
  - [x] 7.2 Create loading indicator components
    - Create LoadingSpinner component in `app/(dashboard)/components/LoadingSpinner.tsx`
    - Create LoadingScreen component for full-page loading states
    - _Requirements: 5.8, 6.8, 8.9_
  - [x] 7.3 Create Navigation component
    - Create `app/(dashboard)/components/Navigation.tsx` with header navigation
    - Include links to home and businesses pages
    - Display authenticated user name and sign-out button
    - Implement responsive mobile menu
    - _Requirements: 12.1, 12.2, 12.3, 12.5, 12.6_
  - [x] 7.4 Create StatsCard component
    - Create `app/(dashboard)/components/StatsCard.tsx` for displaying statistics
    - Support title, value, icon, and variant props
    - Implement variant styling (default, success, info, warning, error, gray)
    - _Requirements: 5.3, 5.4, 5.5_
  - [x] 7.5 Create StatusBadge component
    - Create `app/(dashboard)/components/StatusBadge.tsx` for subscription status display
    - Support all subscription status values with appropriate colors
    - _Requirements: 6.3, 8.5_
  - [x] 7.6 Create RoleBadge component
    - Create `app/(dashboard)/components/RoleBadge.tsx` for user role display
    - Support all role values with appropriate styling
    - _Requirements: 8.4_
  - [ ]\* 7.7 Write property test for navigation display
    - **Property 24: Navigation Header Display**
    - **Validates: Requirements 12.1, 12.2, 12.3**
  - [ ]\* 7.8 Write property test for minimum touch targets
    - **Property 27: Minimum Touch Target Size**
    - **Validates: Requirements 12.6**

- [x] 8. Implement login page
  - [x] 8.1 Create login page with Google Sign-In
    - Create `app/(auth)/login/page.tsx` with Google OAuth button
    - Handle successful sign-in and redirect to home
    - Display error messages for sign-in failures
    - Show specific error for insufficient permissions (non-MASTER_ADMIN)
    - Redirect authenticated users to home page
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.7, 1.8, 1.9, 2.2, 2.4_
  - [ ]\* 8.2 Write property test for Google token transmission
    - **Property 2: Google Token Transmission**
    - **Validates: Requirements 1.5**

- [x] 9. Implement dashboard pages
  - [x] 9.1 Create dashboard layout
    - Create `app/(dashboard)/layout.tsx` with Navigation component
    - Implement client-side auth guard with redirect to login
    - Show loading screen while checking authentication
    - _Requirements: 4.1, 4.5, 12.1_
  - [x] 9.2 Create home page with statistics
    - Create `app/(dashboard)/page.tsx` to display dashboard statistics
    - Use useStats hook to fetch data
    - Display total businesses count
    - Display all subscription status counts using StatsCard components
    - Handle loading and error states
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_
  - [ ]\* 9.3 Write property test for statistics display
    - **Property 8: Statistics Display**
    - **Validates: Requirements 5.3, 5.4, 5.5**

- [x] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implement business list page
  - [x] 11.1 Create BusinessTable component
    - Create `app/(dashboard)/components/BusinessTable.tsx` to display business list
    - Display name, creation date, and subscription status columns
    - Sort businesses by creation date in descending order
    - Make rows clickable to navigate to detail page
    - Show empty state when no businesses found
    - _Requirements: 6.3, 6.4, 6.5_
  - [x] 11.2 Create businesses list page
    - Create `app/(dashboard)/businesses/page.tsx` with search functionality
    - Use useBusinesses hook with search parameter
    - Implement search input field with form submission
    - Provide clear search button
    - Render BusinessTable component
    - Handle loading and error states
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 7.1, 7.2, 7.3, 7.4, 7.5_
  - [ ]\* 11.3 Write property test for business list rendering
    - **Property 9: Business List Rendering**
    - **Validates: Requirements 6.3**
  - [ ]\* 11.4 Write property test for business list sorting
    - **Property 10: Business List Sorting**
    - **Validates: Requirements 6.4**
  - [ ]\* 11.5 Write property test for business navigation
    - **Property 11: Business Navigation**
    - **Validates: Requirements 6.5**
  - [ ]\* 11.6 Write property test for search capture
    - **Property 12: Search Term Capture**
    - **Validates: Requirements 7.2**
  - [ ]\* 11.7 Write property test for search query transmission
    - **Property 13: Search Query Transmission**
    - **Validates: Requirements 7.3**

- [x] 12. Implement business detail page
  - [x] 12.1 Create SubscriptionForm component
    - Create `app/(dashboard)/components/SubscriptionForm.tsx` for editing subscriptions
    - Pre-populate form with current subscription values
    - Implement dropdowns for status and billing interval
    - Implement date-time inputs for period dates
    - Format dates as ISO 8601 on submission
    - Handle submission with loading state
    - Display validation errors from 400 responses
    - Display success message on update
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10, 9.11, 9.12, 9.13, 9.14, 9.15, 9.16, 9.17_
  - [x] 12.2 Create business detail page
    - Create `app/(dashboard)/businesses/[id]/page.tsx` with business ID from route params
    - Use useBusinessDetail hook to fetch data
    - Display business information (name, phone, address, creation date)
    - Display users table with email, name, role, creation date
    - Display subscription information with all fields
    - Implement edit mode toggle for subscription
    - Render SubscriptionForm when editing
    - Handle subscription update with optimistic UI update
    - Handle 404 error with specific message
    - Handle loading and error states
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 9.1, 9.10, 9.11, 9.12_
  - [ ]\* 12.3 Write property test for subscription form pre-population
    - **Property 16: Subscription Form Pre-population**
    - **Validates: Requirements 9.3**
  - [ ]\* 12.4 Write property test for subscription form submission
    - **Property 17: Subscription Form Submission**
    - **Validates: Requirements 9.7, 9.9**
  - [ ]\* 12.5 Write property test for subscription display update
    - **Property 18: Subscription Display Update**
    - **Validates: Requirements 9.10**
  - [ ]\* 12.6 Write property test for validation error display
    - **Property 19: Validation Error Display**
    - **Validates: Requirements 9.14**
  - [ ]\* 12.7 Write property test for business detail display
    - **Property 15: Business Detail Display**
    - **Validates: Requirements 8.3, 8.4, 8.5**

- [x] 13. Add utility functions
  - [x] 13.1 Create date formatting utilities
    - Create `lib/utils/format.ts` with formatDate function for displaying dates
    - Create ISO 8601 conversion utilities for form submissions
    - _Requirements: 9.9_
  - [x] 13.2 Create validation helpers
    - Create `lib/utils/validation.ts` for client-side form validation
    - Implement date range validation for subscription periods
    - _Requirements: 9.6_

- [x] 14. Implement responsive design
  - [x] 14.1 Add responsive styles and mobile adaptations
    - Update all components with Tailwind responsive classes
    - Implement mobile hamburger menu in Navigation component
    - Make BusinessTable responsive with horizontal scroll or card layout
    - Ensure statistics grid adapts to screen size (1/2/3 columns)
    - Verify all touch targets meet 44px minimum
    - _Requirements: 12.4, 12.5, 12.6_
  - [ ]\* 14.2 Write property test for responsive layout
    - **Property 26: Responsive Layout Adaptation**
    - **Validates: Requirements 12.4**

- [x] 15. Final checkpoint and integration testing
  - [x] 15.1 Test complete authentication flow
    - Verify Google sign-in works correctly
    - Verify session persistence across page refreshes
    - Verify sign-out clears session and redirects
    - Verify role enforcement rejects non-MASTER_ADMIN users
    - _Requirements: 1.1-2.4, 3.1-3.7_
  - [x] 15.2 Test all pages and navigation
    - Verify route protection works for all protected routes
    - Verify navigation between pages works correctly
    - Verify statistics display correctly on home page
    - Verify business search and list display work
    - Verify business detail page shows all information
    - Verify subscription editing and update work
    - _Requirements: 4.1-12.6_
  - [x] 15.3 Test error handling
    - Verify 401 responses clear session and redirect to login
    - Verify 404 responses show appropriate messages
    - Verify 400 validation errors display correctly
    - Verify 5xx errors show generic error message
    - _Requirements: 10.1-10.7_
  - [x] 15.4 Verify configuration and deployment readiness
    - Verify environment variables are correctly loaded
    - Verify API URLs are constructed correctly
    - Test build process runs successfully
    - _Requirements: 11.1-11.5_

- [x] 16. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The implementation uses Next.js 16.3.4 App Router with TypeScript
- All API communication includes Bearer token authentication
- Session is stored in browser localStorage for persistence
- Property tests validate universal correctness properties across randomized inputs
- Unit tests would validate specific examples and edge cases
- Checkpoints ensure incremental validation at key milestones

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.2", "3.1", "3.2"] },
    { "id": 2, "tasks": ["2.3", "2.4", "4.1"] },
    {
      "id": 3,
      "tasks": ["2.5", "2.6", "2.7", "2.8", "3.3", "3.4", "3.5", "4.2", "5.1"]
    },
    { "id": 4, "tasks": ["5.2", "5.3", "6.1", "6.2", "6.3"] },
    {
      "id": 5,
      "tasks": ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "13.1", "13.2"]
    },
    { "id": 6, "tasks": ["7.7", "7.8", "8.1"] },
    { "id": 7, "tasks": ["8.2", "9.1"] },
    { "id": 8, "tasks": ["9.2"] },
    { "id": 9, "tasks": ["9.3", "11.1"] },
    { "id": 10, "tasks": ["11.2"] },
    { "id": 11, "tasks": ["11.3", "11.4", "11.5", "11.6", "11.7", "12.1"] },
    { "id": 12, "tasks": ["12.2"] },
    { "id": 13, "tasks": ["12.3", "12.4", "12.5", "12.6", "12.7", "14.1"] },
    { "id": 14, "tasks": ["14.2", "15.1", "15.2", "15.3", "15.4"] }
  ]
}
```
