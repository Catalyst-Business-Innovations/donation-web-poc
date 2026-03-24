# Staff Portal — Authentication & Session Management

## Overview

Staff users authenticate via the **Company app SSO** (Single Sign-On). The Donation app is a token-consuming application — it does not have its own credential store. In development, authentication is simulated via `DevAuthService`.

---

## Auth Flow

### Production (Company SSO)

```
Company App (*.rcscbs.com)
  └─ User logs in with company credentials
  └─ Company app sets JWT as domain-scoped cookie (.rcscbs.com / .brijjworks.com)
  └─ User navigates to Donation app
  └─ staffAuthGuard reads JWT cookie → validates expiry + role
  └─ If valid & role=staff → allow access
  └─ If expired → AuthInterceptor attempts token refresh via Company API
  └─ If no token → redirect to Company app login with returnUrl
```

### Development (Simulated)

```
/staff/login (StaffLoginComponent)
  └─ User enters username + any password (except "wrong")
  └─ DevAuthService.loginAsStaff(username)
       ├─ Clears any existing session (cookies, storage)
       ├─ Creates mock JWT with claims:
       │     userid:    staffId (from MockDataService.session)
       │     fullname:  staffName
       │     role:      "staff"
       │     email:     username@brijjworks.com
       │     exp:       now + 24 hours
       ├─ Sets JWT as cookie via AuthService.setTokens()
       └─ Sets CurrentUserService.portal = 'staff'
  └─ Router navigates to returnUrl or /staff/new-donation
```

---

## Guard: `staffAuthGuard`

**File:** `src/app/core/guards/staff-auth.guard.ts`

Applied on the `/staff` parent route in `app.routes.ts`. All child routes inherit this guard.

```
staffAuthGuard
  ├─ AuthService.isAuthenticated()
  │     ├─ Reads 'accessToken' cookie
  │     ├─ Decodes JWT via jwt-decode
  │     ├─ Checks exp claim (with 10s buffer)
  │     └─ Returns true/false
  │
  ├─ If NOT authenticated:
  │     ├─ Save current URL to sessionStorage (STAFF_RETURN_URL)
  │     └─ Redirect to /staff/login
  │
  ├─ If authenticated but role ≠ 'staff':
  │     ├─ Toast: "Access Denied"
  │     └─ Redirect to /donor/dashboard
  │
  └─ If authenticated + role = 'staff':
        └─ Allow access ✓
```

---

## JWT Token Structure

```json
{
  "header": { "alg": "HS256", "typ": "JWT" },
  "payload": {
    "userid": "1",
    "companyid": "1",
    "email": "alex@brijjworks.com",
    "fullname": "Alex Morgan",
    "role": "staff",
    "phonenumber": "(555) 100-0000",
    "sub": "1",
    "iss": "dev-auth-simulator",
    "aud": "donation-app",
    "iat": 1711267200,
    "nbf": 1711267200,
    "exp": 1711353600
  }
}
```

### Key Claims

| Claim | Purpose |
|-------|---------|
| `userid` | Staff member ID (maps to `MockDataService.session.staffId`) |
| `role` | Must be `"staff"` for staff portal access |
| `fullname` | Display name in navbar |
| `email` | Display email in profile |
| `exp` | Expiry timestamp (Unix seconds) |

---

## Session Lifecycle

### Login
1. `StaffLoginComponent.ngOnInit()` — if already authenticated as staff, auto-redirect to portal
2. `StaffLoginComponent.ngOnInit()` — if authenticated as donor, clear session and show login form
3. `StaffLoginComponent.login()` → `DevAuthService.loginAsStaff()` → set JWT cookie → navigate

### Active Session
- `CurrentUserService` resolves portal context from JWT `role` claim
- `displayName` = `MockDataService.session.staffName`
- `initials` = computed from display name
- `email` = from JWT `email` claim
- `staffSession()` = `MockDataService.session` (staffId, locationId, locationName)

### Token Refresh (Production)
- `AuthInterceptor` catches 401 responses
- Attempts refresh via `AuthService.refreshAccessToken()` → Company API `/auth/refresh`
- If refresh succeeds → retries original request with new token
- If refresh fails → clears session → redirects to `/staff/login`
- Dev mock tokens (prefixed `refresh-`) skip refresh and redirect directly

### Logout
1. Navbar "Sign Out" button → `StaffLayoutComponent.signOut()`
2. `DevAuthService.logout()` → `AuthService.clearAuthData()`
   - Clears `accessToken`, `refreshToken`, `sessionId` cookies
   - Clears `USER_INFO` from localStorage
   - Clears auth-related sessionStorage keys
   - Invalidates cached decoded token
3. Router navigates to `/staff/login`

### Page Refresh
- JWT persists in cookie across page reloads
- `CurrentUserService` rehydrates on init:
  - `resolvePortalFromToken()` → reads `role` from JWT → sets `_portal` signal
  - `resolveDonorIdFromToken()` → N/A for staff (defaults to first donor)
- Guard re-validates JWT on every route change

---

## Key Files

| File | Purpose |
|------|---------|
| `core/guards/staff-auth.guard.ts` | Route guard — JWT + role validation |
| `core/services/auth.service.ts` | Token CRUD, decode, expiry check |
| `core/services/dev-auth.service.ts` | Dev-only JWT generation |
| `core/services/current-user.service.ts` | Reactive user context (signals) |
| `core/interceptors/auth.interceptor.ts` | Bearer header, 401 refresh, timeout |
| `core/constants/storage-keys.ts` | Centralized storage key constants |
| `core/models/auth.models.ts` | UserInfo, DecodedToken, LoginRequest/Response |
| `modules/staff-portal/features/login/` | Staff login page (dev simulation) |

---

## Security Considerations

- JWT stored in cookies (not localStorage) — less vulnerable to XSS
- Domain-scoped cookies in production (`.rcscbs.com` / `.brijjworks.com`)
- Localhost uses path-scoped cookies (`/`)
- 10-second buffer before token expiry to prevent edge-case 401s
- `clearAuthData()` wipes all auth artifacts (cookies + storage + cache)
- Open redirect protection via `isSafeRedirectUrl()` on returnUrl
- Error messages sanitized before display (max 200 chars, no raw API internals)
