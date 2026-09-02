# Requirements Document

## Introduction

The Restock Admin Dashboard is a master-admin web console for managing multi-tenant shop businesses and their subscriptions. It provides authenticated access exclusively to users with MASTER_ADMIN role to view system-wide statistics, search and browse businesses, view detailed business information with associated users and subscription data, and modify subscription parameters. The dashboard integrates with an existing NestJS backend API that enforces role-based access control.

## Glossary

- **Admin_Dashboard**: The Next.js web application providing the master admin interface
- **Backend_API**: The NestJS REST API at the configured API base URL providing authentication and admin endpoints
- **Master_Admin**: A user with the MASTER_ADMIN role as defined in the backend User entity
- **Business**: A tenant entity representing a shop, containing name, contact information, associated users, and one subscription
- **Subscription**: An entity linked one-to-one with a Business, tracking billing status, interval, and period dates
- **Google_Sign_In**: Authentication flow using Google OAuth2 where the client obtains an ID token and sends it to the Backend_API
- **Session**: Client-side authentication state containing the access token and user profile returned from successful sign-in
- **Access_Token**: A JWT issued by the Backend_API after successful authentication, containing user ID, email, role, and business ID claims
- **Auth_Guard**: Client-side navigation protection mechanism that redirects unauthenticated users to the login page
- **Subscription_Status**: An enumeration with values TRIALING, ACTIVE, PAST_DUE, SUSPENDED, CANCELED representing subscription lifecycle states
- **Billing_Interval**: An enumeration with values MONTHLY, YEARLY representing subscription billing frequency
- **Stats_Endpoint**: The GET /admin/stats API endpoint returning total business count and subscription status distribution
- **Businesses_Endpoint**: The GET /admin/businesses API endpoint returning a list of businesses with optional name-based search
- **Business_Detail_Endpoint**: The GET /admin/businesses/:id API endpoint returning a single business with users and subscription
- **Update_Subscription_Endpoint**: The PATCH /admin/businesses/:id/subscription API endpoint for modifying subscription fields

## Requirements

### Requirement 1: Authentication with Google Sign-In

**User Story:** As a master admin, I want to sign in using my Google account, so that I can securely access the admin dashboard without managing separate credentials.

#### Acceptance Criteria

1.1. THE Admin_Dashboard SHALL provide a login page as the default unauthenticated route

1.2. WHEN a user accesses the login page, THE Admin_Dashboard SHALL display a Google sign-in button

1.3. WHEN a user clicks the Google sign-in button, THE Admin_Dashboard SHALL initiate the Google_Sign_In flow using the configured Google client ID

1.4. WHEN Google_Sign_In completes successfully, THE Admin_Dashboard SHALL receive an ID token from Google

1.5. WHEN the Admin_Dashboard receives a Google ID token, THE Admin_Dashboard SHALL send the token to the Backend_API POST /auth/google endpoint

1.6. WHEN the Backend_API responds with an access token and user object, THE Admin_Dashboard SHALL store the Access_Token and user profile in the Session

1.7. WHEN the Session is established, THE Admin_Dashboard SHALL redirect the user to the home page

1.8. IF the Backend_API returns a 401 Unauthorized response, THEN THE Admin_Dashboard SHALL display an error message indicating invalid credentials

1.9. IF the Backend_API returns an error response other than 401, THEN THE Admin_Dashboard SHALL display a generic error message indicating sign-in failure

### Requirement 2: Master Admin Role Enforcement

**User Story:** As a system administrator, I want only master admin users to access the dashboard, so that business owners cannot access system-wide management features.

#### Acceptance Criteria

2.1. WHEN the Backend_API returns a user object with role other than MASTER_ADMIN, THE Admin_Dashboard SHALL reject the sign-in attempt

2.2. WHEN a non-master-admin sign-in is rejected, THE Admin_Dashboard SHALL display an error message indicating insufficient permissions

2.3. WHEN a non-master-admin sign-in is rejected, THE Admin_Dashboard SHALL clear any stored authentication state

2.4. WHEN a non-master-admin sign-in is rejected, THE Admin_Dashboard SHALL remain on the login page

### Requirement 3: Session Management

**User Story:** As a master admin, I want my session to persist across browser refreshes, so that I do not have to sign in repeatedly during active use.

#### Acceptance Criteria

3.1. WHEN the Admin_Dashboard stores authentication state, THE Admin_Dashboard SHALL persist the Access_Token in browser storage

3.2. WHEN the Admin_Dashboard stores authentication state, THE Admin_Dashboard SHALL persist the user profile in browser storage

3.3. WHEN the Admin_Dashboard loads, THE Admin_Dashboard SHALL attempt to restore the Session from browser storage

3.4. WHEN the Session is restored, THE Admin_Dashboard SHALL validate the Access_Token is present and non-empty

3.5. IF the restored Access_Token is expired or invalid as indicated by Backend_API 401 response, THEN THE Admin_Dashboard SHALL clear the Session and redirect to the login page

3.6. THE Admin_Dashboard SHALL provide a sign-out action that clears the Session from browser storage

3.7. WHEN the user signs out, THE Admin_Dashboard SHALL redirect to the login page

### Requirement 4: Navigation Guards

**User Story:** As a system administrator, I want protected pages to be inaccessible without authentication, so that unauthorized users cannot view sensitive business data.

#### Acceptance Criteria

4.1. WHEN a user attempts to access a protected route without a valid Session, THE Admin_Dashboard SHALL redirect the user to the login page

4.2. THE Admin_Dashboard SHALL treat the home page as a protected route

4.3. THE Admin_Dashboard SHALL treat the business list page as a protected route

4.4. THE Admin_Dashboard SHALL treat the business detail page as a protected route

4.5. WHEN a user with a valid Session accesses a protected route, THE Admin_Dashboard SHALL render the requested page

4.6. WHEN a user with a valid Session accesses the login page, THE Admin_Dashboard SHALL redirect to the home page

### Requirement 5: Dashboard Statistics Display

**User Story:** As a master admin, I want to view system-wide statistics on the home page, so that I can quickly assess the overall state of businesses and subscriptions.

#### Acceptance Criteria

5.1. WHEN the home page loads, THE Admin_Dashboard SHALL request statistics from the Stats_Endpoint

5.2. WHEN the home page loads, THE Admin_Dashboard SHALL include the Access_Token in the Authorization header as a Bearer token

5.3. WHEN the Stats_Endpoint responds successfully, THE Admin_Dashboard SHALL display the total business count

5.4. WHEN the Stats_Endpoint responds successfully, THE Admin_Dashboard SHALL display the count of businesses for each Subscription_Status value

5.5. WHEN the Stats_Endpoint responds successfully, THE Admin_Dashboard SHALL display subscription status counts for TRIALING, ACTIVE, PAST_DUE, SUSPENDED, and CANCELED

5.6. IF the Stats_Endpoint returns a 401 Unauthorized response, THEN THE Admin_Dashboard SHALL clear the Session and redirect to the login page

5.7. IF the Stats_Endpoint returns an error response other than 401, THEN THE Admin_Dashboard SHALL display an error message indicating statistics could not be loaded

5.8. WHILE the statistics request is pending, THE Admin_Dashboard SHALL display a loading indicator

### Requirement 6: Business List Display

**User Story:** As a master admin, I want to view a list of all businesses, so that I can browse and select businesses for detailed inspection.

#### Acceptance Criteria

6.1. WHEN the business list page loads, THE Admin_Dashboard SHALL request the business list from the Businesses_Endpoint

6.2. WHEN the business list page loads, THE Admin_Dashboard SHALL include the Access_Token in the Authorization header as a Bearer token

6.3. WHEN the Businesses_Endpoint responds successfully, THE Admin_Dashboard SHALL display each Business with its name, creation date, and subscription status

6.4. WHEN the Businesses_Endpoint responds successfully, THE Admin_Dashboard SHALL sort businesses by creation date in descending order

6.5. WHEN a user clicks on a Business in the list, THE Admin_Dashboard SHALL navigate to the business detail page for that Business

6.6. IF the Businesses_Endpoint returns a 401 Unauthorized response, THEN THE Admin_Dashboard SHALL clear the Session and redirect to the login page

6.7. IF the Businesses_Endpoint returns an error response other than 401, THEN THE Admin_Dashboard SHALL display an error message indicating the business list could not be loaded

6.8. WHILE the business list request is pending, THE Admin_Dashboard SHALL display a loading indicator

### Requirement 7: Business Search

**User Story:** As a master admin, I want to search for businesses by name, so that I can quickly find a specific business without scrolling through the entire list.

#### Acceptance Criteria

7.1. THE Admin_Dashboard SHALL provide a search input field on the business list page

7.2. WHEN a user enters text in the search field, THE Admin_Dashboard SHALL capture the search term

7.3. WHEN a user submits the search, THE Admin_Dashboard SHALL request the business list from the Businesses_Endpoint with the search query parameter

7.4. WHEN the Businesses_Endpoint receives a search parameter, THE Admin_Dashboard SHALL display only businesses matching the search term

7.5. WHEN a user clears the search field, THE Admin_Dashboard SHALL request the full business list without a search parameter

7.6. THE Admin_Dashboard SHALL perform case-insensitive partial matching on business names as implemented by the Backend_API

### Requirement 8: Business Detail View

**User Story:** As a master admin, I want to view detailed information about a specific business, so that I can see all associated users and subscription details in one place.

#### Acceptance Criteria

8.1. WHEN the business detail page loads, THE Admin_Dashboard SHALL request business details from the Business_Detail_Endpoint using the business ID from the route parameter

8.2. WHEN the business detail page loads, THE Admin_Dashboard SHALL include the Access_Token in the Authorization header as a Bearer token

8.3. WHEN the Business_Detail_Endpoint responds successfully, THE Admin_Dashboard SHALL display the business name, phone, address, and creation date

8.4. WHEN the Business_Detail_Endpoint responds successfully, THE Admin_Dashboard SHALL display all associated users with their email, name, role, and creation date

8.5. WHEN the Business_Detail_Endpoint responds successfully, THE Admin_Dashboard SHALL display the Subscription with its status, billing interval, current period start, current period end, and creation date

8.6. IF the Business_Detail_Endpoint returns a 404 Not Found response, THEN THE Admin_Dashboard SHALL display an error message indicating the business was not found

8.7. IF the Business_Detail_Endpoint returns a 401 Unauthorized response, THEN THE Admin_Dashboard SHALL clear the Session and redirect to the login page

8.8. IF the Business_Detail_Endpoint returns an error response other than 401 or 404, THEN THE Admin_Dashboard SHALL display an error message indicating business details could not be loaded

8.9. WHILE the business detail request is pending, THE Admin_Dashboard SHALL display a loading indicator

### Requirement 9: Subscription Editing

**User Story:** As a master admin, I want to edit subscription details for a business, so that I can manually adjust billing status, interval, and period dates.

#### Acceptance Criteria

9.1. WHEN viewing a business detail page, THE Admin_Dashboard SHALL provide an edit action for the Subscription

9.2. WHEN a user initiates subscription editing, THE Admin_Dashboard SHALL display an edit form with fields for subscription status, billing interval, current period start, and current period end

9.3. WHEN displaying the edit form, THE Admin_Dashboard SHALL pre-populate fields with current Subscription values

9.4. THE Admin_Dashboard SHALL provide a Subscription_Status dropdown with options TRIALING, ACTIVE, PAST_DUE, SUSPENDED, and CANCELED

9.5. THE Admin_Dashboard SHALL provide a Billing_Interval dropdown with options MONTHLY and YEARLY

9.6. THE Admin_Dashboard SHALL provide date-time input fields for current period start and current period end

9.7. WHEN a user submits the edit form, THE Admin_Dashboard SHALL send the modified fields to the Update_Subscription_Endpoint using the business ID

9.8. WHEN submitting to the Update_Subscription_Endpoint, THE Admin_Dashboard SHALL include the Access_Token in the Authorization header as a Bearer token

9.9. WHEN submitting to the Update_Subscription_Endpoint, THE Admin_Dashboard SHALL format period dates as ISO 8601 strings

9.10. WHEN the Update_Subscription_Endpoint responds successfully, THE Admin_Dashboard SHALL update the displayed Subscription with the response data

9.11. WHEN the Update_Subscription_Endpoint responds successfully, THE Admin_Dashboard SHALL close the edit form

9.12. WHEN the Update_Subscription_Endpoint responds successfully, THE Admin_Dashboard SHALL display a success message indicating the subscription was updated

9.13. IF the Update_Subscription_Endpoint returns a 404 Not Found response, THEN THE Admin_Dashboard SHALL display an error message indicating the subscription was not found

9.14. IF the Update_Subscription_Endpoint returns a 400 Bad Request response, THEN THE Admin_Dashboard SHALL display validation error messages from the response

9.15. IF the Update_Subscription_Endpoint returns a 401 Unauthorized response, THEN THE Admin_Dashboard SHALL clear the Session and redirect to the login page

9.16. IF the Update_Subscription_Endpoint returns an error response other than 400, 401, or 404, THEN THE Admin_Dashboard SHALL display an error message indicating the subscription could not be updated

9.17. WHILE the subscription update request is pending, THE Admin_Dashboard SHALL disable the submit button and display a loading indicator

### Requirement 10: API Error Handling

**User Story:** As a master admin, I want clear error messages when API requests fail, so that I understand what went wrong and can take appropriate action.

#### Acceptance Criteria

10.1. WHEN any Backend_API request returns a 401 Unauthorized response, THE Admin_Dashboard SHALL treat the Session as invalid

10.2. WHEN the Session is treated as invalid, THE Admin_Dashboard SHALL clear authentication state from browser storage

10.3. WHEN the Session is treated as invalid, THE Admin_Dashboard SHALL redirect to the login page

10.4. WHEN any Backend_API request returns a 4xx error response other than 401, THE Admin_Dashboard SHALL display the error message from the response body if available

10.5. WHEN any Backend_API request returns a 5xx error response, THE Admin_Dashboard SHALL display a generic server error message

10.6. WHEN any Backend_API request fails due to network error, THE Admin_Dashboard SHALL display a network connectivity error message

10.7. THE Admin_Dashboard SHALL log all API errors to the browser console for debugging purposes

### Requirement 11: Configuration Management

**User Story:** As a developer, I want API endpoints and Google client ID to be configurable, so that the dashboard can work across development, staging, and production environments.

#### Acceptance Criteria

11.1. THE Admin_Dashboard SHALL read the Backend_API base URL from environment configuration

11.2. THE Admin_Dashboard SHALL read the Google client ID from environment configuration

11.3. THE Admin_Dashboard SHALL construct all API request URLs by combining the configured base URL with the endpoint path

11.4. THE Admin_Dashboard SHALL use the configured Google client ID when initializing Google_Sign_In

11.5. WHEN environment configuration is missing required values, THE Admin_Dashboard SHALL fail to initialize and display a configuration error

### Requirement 12: Responsive Layout

**User Story:** As a master admin, I want the dashboard to be usable on different screen sizes, so that I can access it from desktop computers and tablets.

#### Acceptance Criteria

12.1. THE Admin_Dashboard SHALL display a navigation header on all authenticated pages

12.2. THE Admin_Dashboard SHALL include links to the home page and business list page in the navigation header

12.3. THE Admin_Dashboard SHALL include the signed-in user's name and a sign-out button in the navigation header

12.4. THE Admin_Dashboard SHALL use a responsive layout that adapts to screen widths from 768 pixels to 1920 pixels

12.5. WHEN displayed on screens narrower than 768 pixels, THE Admin_Dashboard SHALL use a mobile-optimized layout

12.6. THE Admin_Dashboard SHALL ensure all interactive elements have a minimum touch target size of 44 pixels by 44 pixels for touch-screen devices
