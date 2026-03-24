# Security Guidelines

**For Angular Frontend Development — Brijjworks Donation App**

- **Version:** 1.0
- **Last Updated:** 2026-03-24
- **Audience:** Developers, Coding Agents, Security Reviewers

---

## 1. Authentication & Token Management

### 1.1 JWT Handling

- **Never store tokens in `localStorage`** — use cookies with security attributes
- **Never verify JWT signatures on the frontend** — signature verification is the backend's responsibility. The frontend only decodes claims for UI routing and display.
- **Always check `exp` claim with a buffer** — use a 10-second buffer before expiry to prevent edge-case 401s:
  ```typescript
  const expirationTime = decoded.exp * 1000;
  return Date.now() < expirationTime - 10000;
  ```
- **Cache decoded tokens** — avoid repeated Base64 decoding. Invalidate cache when tokens are set or cleared.
- **Clear all auth artifacts on logout** — cookies, localStorage, sessionStorage, in-memory cache.

### 1.2 Cookie Security Attributes

All auth cookies **must** include:

| Attribute | Value | Why |
|-----------|-------|-----|
| `Secure` | `true` (production) | Cookies only sent over HTTPS |
| `SameSite` | `Lax` | Prevents CSRF while allowing navigation-initiated requests |
| `path` | `/` | Available to all routes |
| `domain` | `.rcscbs.com` / `.brijjworks.com` | Shared across subdomains (production only) |

```typescript
// Production
{ path: '/', domain: '.rcscbs.com', secure: true, sameSite: 'Lax' }

// Localhost (dev)
{ path: '/', secure: false, sameSite: 'Lax' }
```

**Note:** `HttpOnly` cannot be set from JavaScript — this must be configured on the backend when the Company app sets the cookies.

### 1.3 Session Isolation

- **Login must clear any previous session** before creating a new one — prevents cross-portal session bleed
- **Each portal has a separate guard** with role validation — `staffAuthGuard` requires `role === 'staff'`, `donorAuthGuard` requires `role === 'donor'`
- **`CurrentUserService` setters validate against JWT claims** — `setPortal()` rejects if JWT role doesn't match, `setDonorId()` rejects if JWT userid doesn't match
- **Login pages auto-redirect** if the user already has a valid session with the correct role

### 1.4 Token Refresh

- Interceptor catches 401 responses and attempts token refresh
- Refresh queue prevents concurrent refresh attempts (BehaviorSubject pattern)
- Dev mock tokens (prefixed `refresh-`) skip refresh and redirect to login
- On refresh failure, **always clear auth data before redirecting** to prevent stale token loops

---

## 2. XSS Prevention

### 2.1 Angular Built-In Protection

Angular sanitizes all template bindings by default. **Do not bypass this:**

```typescript
// NEVER do this
[innerHTML]="userInput"
bypassSecurityTrustHtml(userInput)

// Angular auto-sanitizes these — safe
{{ userInput }}
[textContent]="userInput"
[attr.title]="userInput"
```

### 2.2 Dynamic HTML (Label Printing, Emails)

When constructing HTML outside Angular templates (e.g., `document.write()`, email previews):

```typescript
// ALWAYS escape user-provided values
private escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Usage
const safeNotes = this.escapeHtml(container.notes);
win.document.write(`<div class="notes">${safeNotes}</div>`);
```

**Fields that must be escaped:**
- User-entered notes, descriptions, names
- Any field that could contain `< > " ' &` characters

**Fields safe to interpolate without escaping:**
- Numeric values (quantities, IDs)
- Enum labels (from code-defined constants)
- Dates formatted via `toLocaleDateString()`

### 2.3 Cross-Origin Messaging

When using `BroadcastChannel` or `postMessage`:

```typescript
// ALWAYS validate message structure
channel.onmessage = (event: MessageEvent) => {
  const data = event.data;
  if (typeof data !== 'object' || data === null || !('type' in data)) return;
  if (!['approved', 'declined'].includes(data.type)) return;

  // Validate individual fields before use
  const txnRef = typeof data.txnRef === 'string' ? data.txnRef : '';
};
```

---

## 3. Content Security Policy (CSP)

### 3.1 Current CSP Directives

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data:;
connect-src 'self' https://*.rcscbs.com https://*.brijjworks.com;
frame-ancestors 'none';
base-uri 'self';
form-action 'self'
```

### 3.2 Directive Purpose

| Directive | Purpose |
|-----------|---------|
| `default-src 'self'` | Restrict all resources to same origin |
| `script-src 'self'` | No inline scripts, no external JS |
| `style-src 'unsafe-inline'` | Required for Angular component styles |
| `connect-src` | API calls limited to company domains |
| `frame-ancestors 'none'` | Prevents clickjacking (cannot be iframed) |
| `base-uri 'self'` | Prevents `<base>` tag injection |
| `form-action 'self'` | Prevents form submission to external domains |

### 3.3 CSP Violations to Watch

- Adding new CDN resources requires updating `style-src`, `script-src`, or `font-src`
- Adding new API domains requires updating `connect-src`
- `'unsafe-inline'` for styles is required by Angular — do not add it to `script-src`

---

## 4. Open Redirect Protection

### 4.1 URL Validation

All redirect URLs must pass through `isSafeRedirectUrl()`:

```typescript
function isSafeRedirectUrl(url: string): boolean {
  if (url.startsWith('/')) return true;  // Relative paths — always safe
  try {
    const parsed = new URL(url);
    const allowedDomains = [environment.domainName, 'localhost', '127.0.0.1'];
    return allowedDomains.some(
      domain => parsed.hostname === domain || parsed.hostname.endsWith('.' + domain)
    );
  } catch {
    return false;  // Malformed URLs — reject
  }
}
```

### 4.2 Rules

- **Never assign `window.location.href` with unvalidated URLs**
- **Return URLs stored in `sessionStorage`** are path-only (from `state.url`), which are relative and safe
- **External redirects** (e.g., to Company app login) use `environment.companyUrl` — a trusted, code-defined value

---

## 5. Error Handling & Information Disclosure

### 5.1 Error Display Rules

**Client errors (4xx)** — show the API message to the user. These are intentional responses (validation failures, not found, forbidden) that the user needs to act on.

**Server errors (5xx)** — never show raw API internals. Always use a generic message.

| Status Range | Display | Example |
|-------------|---------|---------|
| 400, 422 | API message (validation errors) | "Email is already registered" |
| 403 | API message or fallback | "Access denied" |
| 404 | API message or fallback | "Donation not found" |
| 429 | Fallback | "Too many requests. Please try again later." |
| 500, 502, 503 | **Generic only** | "A server error occurred. Please try again later." |

```typescript
// Client errors — show API message
if (error.status >= 400 && error.status < 500) {
  toastService.error(extractClientErrorMessage(error));
}

// Server errors — generic message only
if (error.status >= 500) {
  toastService.error('A server error occurred. Please try again later.');
}
```

The `extractClientErrorMessage()` function in the interceptor:
1. Tries `error.error.message` (standard API format)
2. Tries `error.error` as plain string
3. Tries `error.error.errors[]` (validation error array for 422)
4. Falls back to a status-specific generic message

- **Never expose stack traces** in production
- **Never log sensitive data** (tokens, passwords, PII) to console

### 5.2 Production Error Handler

- `GlobalErrorHandler` builds structured error objects in production
- **No `console.error()` in production** — only send to error tracking service
- Development mode logs full errors to console for debugging

### 5.3 Console Logging Policy

| Environment | Allowed |
|-------------|---------|
| Development | `console.error()`, `console.warn()` for debugging |
| Production | **No console output** — send to error tracking service only |

---

## 6. Input Validation

### 6.1 Frontend Validation

- **Validate all form inputs** before submission (required fields, format, length)
- **Trim whitespace** on text inputs before sending to API
- **Validate numeric inputs** — check `isNaN()`, bounds

### 6.2 Data from External Sources

- **JWT claims** — always check for `null`/`undefined` before using
- **API responses** — never assume shape; use optional chaining and defaults
- **BroadcastChannel messages** — validate `typeof` before processing
- **URL parameters** — validate via `isSafeRedirectUrl()` before redirecting

### 6.3 Initials Generation Safety

When generating user initials from names:

```typescript
// SAFE — guards against empty strings
initials: `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase()

// UNSAFE — crashes on empty string
initials: `${firstName[0]}${lastName[0]}`
```

---

## 7. Sensitive Data Handling

### 7.1 Storage Rules

| Data Type | Storage | Encrypted | Notes |
|-----------|---------|-----------|-------|
| Access Token | Cookie | No (HTTPS in transit) | `Secure`, `SameSite: Lax` |
| Refresh Token | Cookie | No | Should be `HttpOnly` (backend-set) |
| Session ID | Cookie | No | Should be `HttpOnly` (backend-set) |
| User Info | In-memory (decoded from JWT) | N/A | **Never persist to localStorage** |
| Mock Data | localStorage (dev only) | No | Excluded in production |
| Return URLs | sessionStorage | No | Path-only, cleared after use |

### 7.2 What NOT to Store Client-Side

- Passwords or password hashes
- API keys or secrets
- Full user PII (addresses, SSN, financial data)
- Audit logs or access logs

---

## 8. CSRF Protection

### 8.1 Current Mitigations

- `SameSite: Lax` cookies prevent cross-site cookie submission
- Angular `HttpClient` does not send cookies with cross-origin requests by default
- CSP `form-action 'self'` prevents form hijacking

### 8.2 Production Requirements

- Backend **must** implement CSRF token validation on state-changing endpoints
- Consider double-submit cookie pattern if backend doesn't use session-based CSRF

---

## 9. Dependency Security

### 9.1 Current Dependencies

All dependencies are from official npm registry with no known critical CVEs:
- `@angular/*` v20.0.0
- `jwt-decode` v4.0.0
- `ngx-cookie-service` v20.0.1
- `qrcode` v1.5.4
- `rxjs` v7.8.0

### 9.2 Maintenance Rules

- Run `npm audit` weekly and after every `npm install`
- Use `npm ci` in CI/CD for reproducible builds
- Keep `package-lock.json` committed
- Update dependencies monthly — prioritize security patches
- Never install packages from unverified registries

---

## 10. Security Headers Checklist

### 10.1 Frontend (index.html)

| Header | Status | Value |
|--------|--------|-------|
| Content-Security-Policy | ✅ Set | See section 3.1 |
| X-Content-Type-Options | ✅ Set | `nosniff` |
| Referrer-Policy | ✅ Set | `strict-origin-when-cross-origin` |
| Theme-Color | ✅ Set | `#0070b9` |

### 10.2 Backend / Server (must configure)

| Header | Value | Purpose |
|--------|-------|---------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Force HTTPS |
| `X-Frame-Options` | `DENY` | Clickjacking fallback |
| `Permissions-Policy` | `geolocation=(), microphone=(), camera=()` | Restrict browser APIs |
| `Cache-Control` | `no-store` on auth endpoints | Prevent token caching |

---

## 11. Dev vs Production Security

### 11.1 Dev-Only Code

| Component | Dev Behavior | Production Behavior |
|-----------|-------------|-------------------|
| `DevAuthService` | Generates mock JWTs | **Not used** — tokens come from Company SSO / real login API |
| `MockDataService` | Provides seed data | **Not used** — real API endpoints |
| Login components | Accept any password (except "wrong") | Real credential validation via API |
| Cookie `Secure` flag | `false` (localhost HTTP) | `true` (HTTPS only) |
| Error handler | `console.error()` | Error tracking service only |

### 11.2 Production Checklist

Before deploying to production, verify:

- [ ] `DevAuthService` is not called from any production code path
- [ ] `MockDataService` is replaced with real API services
- [ ] JWT signature verification is done on the backend
- [ ] `HttpOnly` flag is set on refresh token cookies (by backend)
- [ ] CSRF token mechanism is implemented on the backend
- [ ] Error tracking service (Sentry/DataDog) is integrated
- [ ] `npm audit` shows no critical vulnerabilities
- [ ] CSP header matches production CDN/API domains
- [ ] HSTS header is configured on the web server
- [ ] Rate limiting is configured on login endpoints (backend)

---

## 12. Incident Response

### 12.1 If a Token is Compromised

1. Clear all cookies and storage immediately via `AuthService.clearAuthData()`
2. Redirect to login page
3. Report to backend team to invalidate the session server-side
4. If refresh token is compromised, all sessions for the user must be revoked

### 12.2 If XSS is Detected

1. Identify the injection point (template binding, innerHTML, document.write)
2. Add `escapeHtml()` sanitization
3. Review CSP headers — tighten `script-src` if possible
4. Audit all `bypassSecurityTrust*` calls (there should be none)

### 12.3 If Open Redirect is Detected

1. Trace the redirect chain to find unvalidated URL
2. Add `isSafeRedirectUrl()` validation
3. Restrict allowed domains in the validator
4. Audit all `window.location.href` assignments

---

## Key Files

| File | Security Role |
|------|--------------|
| `core/services/auth.service.ts` | Token CRUD, cookie security, session cleanup |
| `core/services/dev-auth.service.ts` | Dev-only mock JWT generation |
| `core/services/current-user.service.ts` | User context with JWT validation on setters |
| `core/interceptors/auth.interceptor.ts` | Bearer injection, 401 refresh, error sanitization |
| `core/guards/staff-auth.guard.ts` | Staff role enforcement |
| `core/guards/donor-auth.guard.ts` | Donor role enforcement |
| `core/utils/url-validator.ts` | Open redirect protection |
| `core/services/error-handler.service.ts` | Production error handling (no console) |
| `core/constants/storage-keys.ts` | Centralized storage key constants |
| `src/index.html` | CSP and security meta tags |
