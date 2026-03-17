# Token Sharing Implementation Documentation

## Overview

This document describes how token sharing (authentication token management) is implemented in the Company Management web application. The implementation uses **HTTP-only cookies with domain-level sharing** to enable Single Sign-On (SSO) across multiple subdomains.

## Architecture Components

### 1. Token Storage Mechanism

Tokens are stored as **cookies** with domain-level scope to enable cross-subdomain authentication.

#### Token Types
- **Access Token**: Short-lived JWT token for API authorization (stored in `accessToken` cookie)
- **Refresh Token**: Long-lived token for obtaining new access tokens (stored in `refreshToken` cookie)
- **Session ID**: Session identifier (stored in `sessionId` cookie)

#### Cookie Configuration

**Local Development:**
```typescript
this.cookieService.set('accessToken', token, undefined, '/');
this.cookieService.set('refreshToken', token, undefined, '/');
```

**Production/Staging:**
```typescript
this.cookieService.set('accessToken', token, undefined, '/', `.${environment.domainName}`);
this.cookieService.set('refreshToken', token, undefined, '/', `.${environment.domainName}`);
```

**Domain Configuration:**
- **Development**: `.dev.rcscbs.com`
- **Staging**: `.stg.rcscbs.com`
- **Production**: `.brijjworks.com`

The leading dot (`.`) in the domain allows the cookie to be shared across all subdomains:
- `company.dev.rcscbs.com`
- `pos.dev.rcscbs.com`
- `inventory.dev.rcscbs.com`
- `productionsystem.dev.rcscbs.com`

---

## 2. HTTP Interceptor Service

**Location:** `src/app/core/interceptors/interceptor.service.ts`

The `InterceptorService` implements Angular's `HttpInterceptor` interface to automatically attach authentication tokens to all outgoing HTTP requests.

### Key Features

#### A. Automatic Token Attachment

```typescript
intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  // Skip asset requests
  if (req.url.includes('/assets/')) {
    return next.handle(req);
  }

  // Get token from cookie
  const token = this.cookie.get('accessToken');

  if (token) {
    // Clone request and add Authorization header
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next.handle(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Error handling logic
    }),
  );
}
```

#### B. Token Refresh Mechanism

When a 401 Unauthorized error occurs, the interceptor automatically attempts to refresh the access token.

**Refresh Flow:**

```typescript
private handle401Error(
  req: HttpRequest<any>,
  next: HttpHandler,
  isAuthPage: boolean
): Observable<HttpEvent<any>> {
  if (!this.isRefreshing) {
    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    const refreshToken = this.cookie.get('refreshToken');

    if (refreshToken) {
      const refreshUrl = `${environment.companyApiUrl}/auth/refresh`;

      return this.http.post<any>(refreshUrl, { refreshToken }).pipe(
        switchMap((response: any) => {
          this.isRefreshing = false;
          this.setAccessToken(response.accessToken);
          this.refreshTokenSubject.next(response.accessToken);

          // Retry original request with new token
          req = req.clone({
            setHeaders: { Authorization: `Bearer ${response.accessToken}` },
          });

          return next.handle(req);
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.clearAuthCookies();
          
          if (!isAuthPage) {
            this.toastService.error('Your session has expired. Please log in again.');
            this.router.navigate(['shared/login']);
          }
          return throwError(() => err);
        }),
      );
    }
  }

  // If refresh is in progress, queue the request
  return this.refreshTokenSubject.pipe(
    filter((token) => token !== null),
    take(1),
    switchMap((token) => {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
      return next.handle(req);
    }),
  );
}
```

**Key Aspects:**
- **Single Refresh**: Uses `isRefreshing` flag to prevent multiple simultaneous refresh requests
- **Request Queuing**: Failed requests wait for token refresh completion via `refreshTokenSubject` BehaviorSubject
- **Automatic Retry**: After refresh, queued requests are automatically retried with the new token

#### C. Error Handling

```typescript
catchError((error: HttpErrorResponse) => {
  const isAuthPage = this.isOnAuthPage();

  if (error.status === 401) {
    return this.handle401Error(req, next, isAuthPage);
  } else if (error.status === 403) {
    if (!isAuthPage) {
      this.toastService.error('Access denied. You do not have permission...');
      this.router.navigate(['/home']);
    }
  } else if (error.status === 400) {
    // Handle validation errors
  } else if (error.status === 404 && !isAuthPage) {
    this.toastService.error('The requested resource was not found.');
  } else if (error.status === 500 && !isAuthPage) {
    this.toastService.error('Server error occurred...');
  }

  return throwError(() => error);
});
```

**Protected Routes:**
- Errors on authentication pages (login, reset password, etc.) don't trigger toasts
- Defined in `AUTH_ROUTES` and `AUTH_ROUTE_PREFIXES` arrays

---

## 3. Login Flow

**Location:** `src/app/shared/components/login/login.component.ts`

### Login Process

```typescript
async login() {
  if (this.isLoggingIn) return; // Prevent duplicate requests
  this.isLoggingIn = true;
  this.incorrectLogin = false;
  
  const loginPayload = this.loginInfo.getLoginPayload();
  
  this.sharedService
    .login(loginPayload)
    .toPromise()
    .then((response: any) => {
      if (response && response.accessToken) {
        // 1. Decode JWT token
        this.userInfo = this.master.decodeJwt(response.accessToken);
        const cleanedData = this.removeCustomPrefix(this.userInfo);
        
        // 2. Store user info in localStorage
        localStorage.setItem('user', JSON.stringify(cleanedData));
        sessionStorage.setItem('sessionId', response.sessionId);
        this.cookieService.set('sessionId', response.sessionId);
        
        // 3. Store tokens in cookies
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          this.cookieService.delete('logoutEvent', '/');
          this.cookieService.set('accessToken', response.accessToken, undefined, '/');
          this.cookieService.set('refreshToken', response.refreshToken, undefined, '/');
        } else {
          this.cookieService.delete('logoutEvent', '/', `.${environment.domainName}`);
          this.cookieService.set('accessToken', response.accessToken, undefined, '/', `.${environment.domainName}`);
          this.cookieService.set('refreshToken', response.refreshToken, undefined, '/', `.${environment.domainName}`);
        }
        
        // 4. Navigate to appropriate page
        if (this.redirectTo) {
          window.location.href = this.redirectTo;
        } else if (Number(cleanedData.companyid) == ROOT_COMPANY_ID) {
          this.router.navigate(['/admin-portal/admin-dashboard']);
        } else {
          this.loadRumConfig();
        }
      }
    });
}
```

### Token Decoding

JWT tokens are decoded using the `jwt-decode` library:

```typescript
decodeJwt(token: string): any {
  try {
    const decodedToken = jwtDecode(token);
    return decodedToken;
  } catch (error) {
    console.error('Invalid token', error);
    return null;
  }
}
```

**Token Claims:**
- `userid` - User ID
- `companyid` - Company ID
- `email` - User email
- `fullname` - User's full name
- `role` - User role
- `phonenumber` - Phone number
- `exp` - Expiration timestamp
- `iat` - Issued at timestamp
- `nbf` - Not before timestamp
- `iss` - Issuer

---

## 4. Authentication Guard

**Location:** `src/app/shared/services/authguard.guard.ts`

### Route Protection

```typescript
canActivate(
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
  // Allow public routes
  const publicRoutes = ['/shared/reset-password', '/shared/complete-account-setup'];
  if (publicRoutes.some((p) => state.url.startsWith(p))) {
    return true;
  }

  // Check if user is authenticated
  const user = this.masterService.getUserDetailFromStorage();
  if (!user) {
    this.router.navigate(['/shared/login']);
    return false;
  }

  // Check permissions
  const requiredPermission = route.data['permission'];
  if (requiredPermission === 'General') {
    return true;
  }

  // Load and verify permissions
  const appId = user.companyid > ROOT_COMPANY_ID ? Apps.CompanyPortal : Apps.AdminPortal;
  return this.masterService.getRolesandPerm(appId).then((permissions) => {
    const userPermissions = permissions.map((p) => p.name);
    this.permissionsService.loadPermissions(userPermissions);
    // ... permission checking logic
  });
}
```

---

## 5. Logout and Session Cleanup

**Location:** `src/app/shared/services/shared.service.ts`

### Cleanup Process

```typescript
public performFullSessionCleanup(): void {
  const domain = environment.domainName;
  
  // Clear storage
  localStorage.clear();
  sessionStorage.clear();
  
  // Clear caches
  this.clearAppsCache();
  this.clearCompanyAppsCache();
  
  // Delete all cookies
  this.cookieService.deleteAll('/', `.${domain}`);
  this.cookieService.deleteAll('/', `${domain}`);
  this.cookieService.deleteAll('/');
  this.cookieService.deleteAll('/shared');
}
```

### Logout API Call

```typescript
logout(userDetails: Signout) {
  const url = `${this.companyApiUrl}/Auth/SignOut`;
  return this.http.post(url, userDetails);
}
```

---

## 6. Environment Configuration

**Locations:**
- `src/app/environments/environment.ts` (default/dev)
- `src/app/environments/environment.dev.ts`
- `src/app/environments/environment.stg.ts`
- `src/app/environments/environment.prd.ts`

### Example Configuration

```typescript
const domainName = 'dev.rcscbs.com';

export const environment = {
  id: AppEnvironment.Development,
  production: false,
  domainName,
  companyApiUrl: `https://company-api.${domainName}/api`,
  companyUrl: `https://company.${domainName}`,
  tpmUrl: `https://productionsystem.${domainName}`,
  posUrl: `https://pos.${domainName}`,
  imsUrl: `https://inventory.${domainName}`,
  // ... other configuration
};
```

---

## Security Considerations

### 1. Token Storage
- ✅ Tokens stored in cookies (not localStorage) for better security
- ✅ Domain-scoped cookies enable SSO across subdomains
- ⚠️ Consider adding `Secure` and `HttpOnly` flags in production
- ⚠️ Consider adding `SameSite` attribute for CSRF protection

### 2. Token Transmission
- ✅ Bearer token in Authorization header
- ✅ HTTPS enforced in production
- ✅ Token automatically attached by interceptor

### 3. Token Refresh
- ✅ Automatic token refresh on 401 errors
- ✅ Queued requests wait for refresh completion
- ✅ Failed refresh triggers re-authentication

### 4. Logout
- ✅ Complete session cleanup on logout
- ✅ Domain-wide cookie deletion
- ✅ Server-side logout endpoint called

---

## Integration with Angular App

### Module Configuration

**Location:** `src/app/app.module.ts`

```typescript
providers: [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: InterceptorService,
    multi: true,
  },
  // ... other providers
]
```

The `multi: true` flag allows multiple interceptors to be registered. The `InterceptorService` is automatically applied to all HTTP requests made through Angular's `HttpClient`.

---

## API Endpoints

### Authentication Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/Auth/SignIn` | POST | User login, returns access and refresh tokens |
| `/api/auth/refresh` | POST | Refresh access token using refresh token |
| `/api/Auth/SignOut` | POST | User logout |

### Request/Response Format

**SignIn Request:**
```json
{
  "userName": "user@example.com",
  "password": "password123"
}
```

**SignIn Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionId": "abc123-def456-ghi789"
}
```

**Refresh Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Refresh Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Flow Diagrams

### Login Flow
```
User enters credentials
       ↓
LoginComponent.login()
       ↓
SharedService.login(payload)
       ↓
API: POST /api/Auth/SignIn
       ↓
Response with tokens
       ↓
Decode JWT token
       ↓
Store user info in localStorage
       ↓
Store tokens in cookies (domain-scoped)
       ↓
Navigate to dashboard
```

### API Request Flow
```
Angular HTTP Request
       ↓
InterceptorService.intercept()
       ↓
Get accessToken from cookie
       ↓
Add Authorization header
       ↓
Send request to API
       ↓
┌─────── 200 OK ───────┐
│  Return response     │
└──────────────────────┘
       ↓
┌─────── 401 Unauthorized ────┐
│  handle401Error()           │
│    ↓                        │
│  Get refreshToken           │
│    ↓                        │
│  POST /api/auth/refresh     │
│    ↓                        │
│  Update accessToken cookie  │
│    ↓                        │
│  Retry original request     │
└─────────────────────────────┘
```

### Logout Flow
```
User clicks logout
       ↓
Call API: POST /api/Auth/SignOut
       ↓
SharedService.performFullSessionCleanup()
       ↓
Clear localStorage
       ↓
Clear sessionStorage
       ↓
Delete all cookies (domain-wide)
       ↓
Navigate to login page
```

---

## Troubleshooting

### Common Issues

#### 1. Tokens not shared across subdomains
**Cause:** Domain not configured correctly in cookies  
**Solution:** Ensure cookie domain starts with `.` (e.g., `.dev.rcscbs.com`)

#### 2. Infinite refresh loop
**Cause:** Refresh token also expired  
**Solution:** Check `isRefreshing` flag logic and error handling in `handle401Error()`

#### 3. Token refresh fails silently
**Cause:** Refresh endpoint returning error  
**Solution:** Check backend API logs and refresh token validity

#### 4. User redirected to login unexpectedly
**Cause:** Token expired and refresh failed  
**Solution:** Check token expiration times and refresh token validity

---

## Best Practices

1. **Token Expiration**
   - Keep access tokens short-lived (5-15 minutes)
   - Keep refresh tokens longer-lived (7-30 days)
   - Implement sliding expiration for refresh tokens

2. **Security**
   - Use HTTPS in production
   - Set `Secure` flag on cookies
   - Set `HttpOnly` flag to prevent XSS attacks
   - Set `SameSite` attribute to prevent CSRF

3. **Error Handling**
   - Always handle token refresh failures
   - Provide clear error messages to users
   - Log authentication errors for monitoring

4. **Testing**
   - Test token expiration scenarios
   - Test refresh token flow
   - Test cross-subdomain authentication
   - Test logout cleanup

---

## Related Files

- `src/app/core/interceptors/interceptor.service.ts` - HTTP interceptor
- `src/app/shared/components/login/login.component.ts` - Login component
- `src/app/shared/services/shared.service.ts` - Shared service with API calls
- `src/app/core/services/master.service.ts` - JWT decoding and user management
- `src/app/shared/services/authguard.guard.ts` - Route authentication guard
- `src/app/app.module.ts` - Module configuration
- `src/app/environments/environment*.ts` - Environment configurations

---

## Future Enhancements

1. **Implement Token Rotation**
   - Return new refresh token with each access token refresh
   - Invalidate old refresh tokens

2. **Add Token Introspection**
   - Validate tokens on critical operations
   - Check token revocation status

3. **Implement Logout from All Devices**
   - Maintain session list on backend
   - Provide UI for session management

4. **Add Remember Me Functionality**
   - Extend token lifetime for trusted devices
   - Use device fingerprinting

5. **Implement PKCE for Enhanced Security**
   - Add Proof Key for Code Exchange (PKCE)
   - Prevent authorization code interception

---

## Conclusion

The token sharing implementation in this application uses domain-scoped cookies to enable seamless Single Sign-On (SSO) across multiple subdomains. The HTTP interceptor automatically handles token attachment, refresh, and error handling, providing a smooth user experience while maintaining security best practices.
