# Donor Portal — Authentication & Session Management

## Overview

Donors authenticate directly against the Donation app's own login. In production, this will be a real API call with email/password credentials. In development, authentication is simulated via `DevAuthService` with mock JWT tokens.

---

## Auth Flow

### Production (Planned)

```
/donor/login (DonorLoginComponent)
  └─ Donor enters email + password
  └─ POST /api/auth/donor-login { email, password }
  └─ API returns { accessToken, refreshToken, sessionId }
  └─ AuthService.setTokens() → stores in cookies
  └─ CurrentUserService.setPortal('donor')
  └─ CurrentUserService.setDonorId(decoded.userid)
  └─ Router navigates to /donor/dashboard
```

### Development (Simulated)

```
/donor/login (DonorLoginComponent)
  └─ Donor enters email + any password (except "wrong")
  └─ DevAuthService.loginAsDonor(email)
       ├─ Clears any existing session (cookies, storage)
       ├─ Finds donor by email in MockDataService.donors
       │     (falls back to first donor if no match)
       ├─ Creates mock JWT with claims:
       │     userid:    donor.id
       │     fullname:  donor.firstName + donor.lastName
       │     role:      "donor"
       │     email:     donor.email
       │     exp:       now + 24 hours
       ├─ Sets JWT as cookie via AuthService.setTokens()
       ├─ Sets CurrentUserService.portal = 'donor'
       └─ Sets CurrentUserService.donorId = donor.id
  └─ Router navigates to returnUrl or /donor/dashboard
```

---

## Guard: `donorAuthGuard`

**File:** `src/app/core/guards/donor-auth.guard.ts`

Applied on the `/donor` parent route in `app.routes.ts`. All child routes inherit this guard — no per-route guards needed.

```
donorAuthGuard
  ├─ AuthService.isAuthenticated()
  │     ├─ Reads 'accessToken' cookie
  │     ├─ Decodes JWT via jwt-decode
  │     ├─ Checks exp claim (with 10s buffer)
  │     └─ Returns true/false
  │
  ├─ If NOT authenticated:
  │     ├─ Save current URL to sessionStorage (DONOR_RETURN_URL)
  │     └─ Redirect to /donor/login
  │
  ├─ If authenticated but role ≠ 'donor':
  │     ├─ Toast: "Access Denied"
  │     └─ Redirect to /staff/new-donation
  │
  └─ If authenticated + role = 'donor':
        └─ Allow access ✓
```

---

## JWT Token Structure

```json
{
  "header": { "alg": "HS256", "typ": "JWT" },
  "payload": {
    "userid": "3",
    "companyid": "1",
    "email": "sarah.johnson@email.com",
    "fullname": "Sarah Johnson",
    "role": "donor",
    "phonenumber": "(555) 234-5678",
    "sub": "3",
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
| `userid` | Donor ID (maps to `MockDataService.donors[].id`) |
| `role` | Must be `"donor"` for donor portal access |
| `fullname` | Display name in navbar |
| `email` | Display email in navbar profile, receipt emails |
| `exp` | Expiry timestamp (Unix seconds) |

---

## Donor Identity Resolution

The `userid` claim in the JWT maps to a `Donor` record in the system:

```
JWT { userid: "3" }
  → CurrentUserService.setDonorId(3)
  → CurrentUserService.donor() → MockDataService.donors.find(d => d.id === 3)
  → All donor portal services use CurrentUserService.donor()
```

### Services That Use Donor Context

| Service | What It Accesses |
|---------|-----------------|
| `HistoryService` | `currentUser.donor()` → donor's donations |
| `DonorDashboardService` | `currentUser.donor()` → stats, tier, impact |
| `ReceiptsService` | `currentUser.donor()` → receipts, email |
| `DonorRewardsService` | `currentUser.donor()` → points, rewards, transactions |
| `ScheduleService` | Location data (not donor-specific) |

---

## Session Lifecycle

### Login
1. `DonorLoginComponent.ngOnInit()` — if already authenticated as donor, auto-redirect to portal
2. `DonorLoginComponent.ngOnInit()` — if authenticated as staff, clear session and show login form
3. `DonorLoginComponent.login()` → `DevAuthService.loginAsDonor()` → set JWT cookie → navigate

### Active Session
- `CurrentUserService` resolves portal context from JWT `role` claim
- `displayName` = `donor.firstName + donor.lastName` (from donor record, not JWT)
- `initials` = computed from display name
- `email` = `donor.email` (from donor record)
- `donorId` = signal, set from JWT `userid` claim

### Donor Selection (Email Matching)

```
DevAuthService.loginAsDonor("sarah.johnson@email.com")
  → findDonorByEmail("sarah.johnson@email.com")
  → MockDataService.donors.find(d => d.email === "sarah.johnson@email.com")
  → If found: use that donor
  → If not found: fall back to donors[0]
```

**Available test donors** (from MockDataService):
- Use any email from the mock donor list
- Any email not in the list defaults to the first donor

### Token Refresh (Production)
- `AuthInterceptor` catches 401 responses
- Attempts refresh via `AuthService.refreshAccessToken()` → Donation API `/auth/refresh`
- If refresh succeeds → retries original request with new token
- If refresh fails → clears session → redirects to `/donor/login`
- Dev mock tokens (prefixed `refresh-`) skip refresh and redirect directly

### Logout
1. Navbar "Sign Out" button → `DonorLayoutComponent.signOut()`
2. `DevAuthService.logout()` → `AuthService.clearAuthData()`
   - Clears `accessToken`, `refreshToken`, `sessionId` cookies
   - Clears `USER_INFO` from localStorage
   - Clears auth-related sessionStorage keys
   - Invalidates cached decoded token
3. Router navigates to `/donor/login`

### Page Refresh
- JWT persists in cookie across page reloads
- `CurrentUserService` rehydrates on init:
  - `resolvePortalFromToken()` → reads `role` from JWT → sets `_portal = 'donor'`
  - `resolveDonorIdFromToken()` → reads `userid` from JWT → sets `_donorId` signal
- Guard re-validates JWT on every route change
- All donor services react to `currentUser.donor()` signal

---

## Cross-Portal Protection

| Scenario | Result |
|----------|--------|
| Donor navigates to `/staff/*` | `staffAuthGuard` → role ≠ 'staff' → toast + redirect to `/donor/dashboard` |
| Staff navigates to `/donor/*` | `donorAuthGuard` → role ≠ 'donor' → toast + redirect to `/staff/new-donation` |
| Donor logs in while staff JWT exists | `DevAuthService.loginAsDonor()` calls `clearAuthData()` first → old JWT wiped |
| Staff logs in while donor JWT exists | `DevAuthService.loginAsStaff()` calls `clearAuthData()` first → old JWT wiped |
| Visit `/donor/login` while already authenticated as donor | `ngOnInit` auto-redirects to `/donor/dashboard` |
| Visit `/donor/login` while authenticated as staff | `ngOnInit` clears staff JWT → shows donor login form |

---

## Differences from Staff Portal

| Aspect | Staff Portal | Donor Portal |
|--------|-------------|-------------|
| **Auth source (production)** | Company app SSO (external JWT cookie) | Direct login API call |
| **Auth source (dev)** | `DevAuthService.loginAsStaff()` | `DevAuthService.loginAsDonor()` |
| **JWT role claim** | `"staff"` | `"donor"` |
| **userid maps to** | `MockDataService.session.staffId` | `MockDataService.donors[].id` |
| **Identity service** | `CurrentUserService.staffSession()` | `CurrentUserService.donor()` |
| **Display name source** | `MockDataService.session.staffName` | `donor.firstName + donor.lastName` |
| **Guard redirect on no auth** | `/staff/login` | `/donor/login` |
| **Guard redirect on wrong role** | `/donor/dashboard` | `/staff/new-donation` |
| **Token refresh (production)** | Company API `/auth/refresh` | Donation API `/auth/refresh` |

---

## Key Files

| File | Purpose |
|------|---------|
| `core/guards/donor-auth.guard.ts` | Route guard — JWT + role validation |
| `core/services/auth.service.ts` | Token CRUD, decode, expiry check |
| `core/services/dev-auth.service.ts` | Dev-only JWT generation + donor matching |
| `core/services/current-user.service.ts` | Reactive user context (portal, donorId, signals) |
| `core/interceptors/auth.interceptor.ts` | Bearer header, 401 refresh, portal-aware redirect |
| `core/constants/storage-keys.ts` | Centralized storage key constants |
| `core/models/auth.models.ts` | UserInfo, DecodedToken interfaces |
| `modules/donor-portal/features/login/` | Donor login page (dev simulation) |
| `modules/donor-portal/donor-portal.routes.ts` | Child routes (no per-route guards) |

---

## Security Considerations

- JWT stored in cookies (not localStorage)
- Domain-scoped cookies in production
- Session isolated per portal — login clears previous session before creating new one
- Donor identity derived from JWT `userid` → verified against donor database
- 10-second buffer before token expiry
- `clearAuthData()` wipes all auth artifacts
- Error messages sanitized before display
- Cross-portal access blocked by role-based guards
