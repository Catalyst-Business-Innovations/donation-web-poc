# Token Sharing Implementation - Donation App

## 🔄 Authentication Flow Overview

The Donation app **consumes** authentication tokens from the Company app. Users login to the Company app, and tokens are shared via domain-scoped cookies.

```
┌──────────────────┐
│   Company App    │
│  (Login Portal)  │
└─────────┬────────┘
          │
          │ 1. User logs in
          │ 2. Company API returns JWT tokens
          │ 3. Tokens stored in domain-scoped cookies
          │    (.dev.rcscbs.com, .stg.rcscbs.com, .brijjworks.com)
          │
          ▼
┌──────────────────────────────────────────┐
│   Shared Cookies (Domain Level)          │
│   - accessToken                          │
│   - refreshToken                         │
│   - sessionId                            │
└──────────────────────────────────────────┘
          │
          │ Cookies automatically sent to all subdomains
          │
          ▼
┌──────────────────┐
│  Donation App    │
│  (This App)      │
│  - Reads tokens  │
│  - Validates     │
│  - Makes API     │
│    calls         │
└──────────────────┘
```

---

## 🎯 Key Points

1. **No Local Login**: This app doesn't have its own login functionality
2. **Token Reading**: Tokens are read from cookies set by Company app
3. **Token Refresh**: Uses Company API to refresh expired tokens
4. **Logout**: Redirects to Company app after logout
5. **Unauthenticated Access**: Redirects to Company app login with return URL

---

## 📋 Implementation Details

### 1. Environment Configuration

All three environments are configured with Company app URLs:

**`src/environments/environment.ts`** (Development)
```typescript
{
  domainName: 'dev.rcscbs.com',
  companyUrl: 'https://company.dev.rcscbs.com',
  companyApiUrl: 'https://company-api.dev.rcscbs.com/api',
  donationApiUrl: 'https://donation-api.dev.rcscbs.com/api',
  // ... other URLs
}
```

**Domain-scoped cookies** allow token sharing:
- Dev: `.dev.rcscbs.com` → company.dev.rcscbs.com, donation.dev.rcscbs.com
- Staging: `.stg.rcscbs.com` → company.stg.rcscbs.com, donation.stg.rcscbs.com
- Production: `.brijjworks.com` → company.brijjworks.com, donation.brijjworks.com

---

### 2. Auth Service

**`src/app/core/services/auth.service.ts`**

Key methods:

#### `redirectToLogin()`
Redirects to Company app login with return URL:
```typescript
redirectToLogin(): void {
  const currentUrl = window.location.href;
  const loginUrl = `${environment.companyUrl}/shared/login?returnUrl=${encodeURIComponent(currentUrl)}`;
  window.location.href = loginUrl;
}
```

#### `getAccessToken()`, `getRefreshToken()`, `getSessionId()`
Read tokens from domain-scoped cookies set by Company app.

#### `refreshAccessToken(refreshToken)`
Uses **Company API** to refresh expired access tokens:
```typescript
refreshAccessToken(refreshToken: string): Observable<RefreshTokenResponse> {
  const url = `${environment.companyApiUrl}/auth/refresh`;
  return this.http.post<RefreshTokenResponse>(url, { refreshToken });
}
```

#### `performLogout()`
Calls Company API logout and redirects to Company app:
```typescript
performLogout(): void {
  this.logout({ sessionId, userId }).subscribe({
    next: () => {
      this.clearAuthData();
      window.location.href = environment.companyUrl;
    }
  });
}
```

---

### 3. HTTP Interceptor

**`src/app/core/interceptors/auth.interceptor.ts`**

Automatically handles authentication for all API requests:

#### Token Attachment
```typescript
intercept(req: HttpRequest<any>, next: HttpHandler) {
  const token = this.authService.getAccessToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next.handle(req);
}
```

#### Auto Token Refresh
When API returns 401 Unauthorized:
1. Gets refresh token from cookie
2. Calls Company API `/auth/refresh` endpoint
3. Updates access token in cookie
4. Retries original request
5. If refresh fails → redirects to Company app login

```typescript
private handle401Error(req: HttpRequest<any>, next: HttpHandler) {
  const refreshToken = this.authService.getRefreshToken();
  
  return this.authService.refreshAccessToken(refreshToken).pipe(
    switchMap(response => {
      this.authService.setAccessToken(response.accessToken);
      return next.handle(this.addAuthHeader(req, response.accessToken));
    }),
    catchError(err => {
      this.authService.clearAuthData();
      this.authService.redirectToLogin(); // Redirect to Company app
      return throwError(() => err);
    })
  );
}
```

---

### 4. Auth Guards

**`src/app/core/guards/auth.guard.ts`**

#### `authGuard`
Protects routes requiring authentication:
- Checks for valid access token in cookies
- If not authenticated → redirects to Company app login
- Stores attempted URL in sessionStorage for post-login redirect

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  
  if (!authService.isAuthenticated()) {
    sessionStorage.setItem('redirectUrl', state.url);
    authService.redirectToLogin(); // Redirects to Company app
    return false;
  }
  
  return true;
};
```

#### `roleGuard`
Protects routes based on user roles:
- Checks authentication first
- Validates user role from JWT token
- Shows error if user lacks required role

```typescript
export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  
  if (!authService.isAuthenticated()) {
    authService.redirectToLogin();
    return false;
  }
  
  const userInfo = authService.getUserInfo();
  const requiredRoles = route.data['roles'] as string[];
  
  if (!requiredRoles.includes(userInfo.role)) {
    alert('Access denied');
    return false;
  }
  
  return true;
};
```

---

### 5. Login Component (Redirect Only)

**`src/app/shared/components/login/login.component.ts`**

This component doesn't handle login - it redirects to Company app:

```typescript
@Component({
  selector: 'app-login',
  template: `
    <div class="redirect-container">
      <h2>Redirecting to login...</h2>
      <p>You will be redirected to the Company portal to sign in.</p>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);

  ngOnInit(): void {
    setTimeout(() => {
      this.authService.redirectToLogin();
    }, 1500);
  }
}
```

---

## 🔐 Token Structure

JWT tokens are created and signed by **Company API**, containing:

```json
{
  "userid": "12345",
  "companyid": "1",
  "email": "user@example.com",
  "fullname": "John Doe",
  "role": "Admin",
  "phonenumber": "+1234567890",
  "exp": 1711234567,
  "iat": 1711230967,
  "nbf": 1711230967,
  "iss": "CompanyAPI"
}
```

This Donation app:
- ✅ **Reads** these tokens from cookies
- ✅ **Decodes** them to get user info
- ✅ **Validates** expiration
- ❌ **Does NOT create** tokens

---

## 🚀 Usage in Routes

### Protect Routes with Auth Guard

**`src/app/app.routes.ts`**

```typescript
import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Public routes
  { path: 'home', component: HomeComponent },
  
  // Protected routes (any authenticated user)
  {
    path: 'donor-portal',
    canActivate: [authGuard],
    loadChildren: () => import('./modules/donor-portal/donor-portal.routes')
  },
  
  // Role-protected routes
  {
    path: 'staff-operations',
    canActivate: [roleGuard],
    data: { roles: ['admin', 'staff'] },
    loadChildren: () => import('./modules/staff-operations/staff-operations.routes')
  },
  {
    path: 'admin-dashboard',
    canActivate: [roleGuard],
    data: { roles: ['admin'] },
    loadChildren: () => import('./modules/admin-dashboard/admin-dashboard.routes')
  }
];
```

---

## 💻 Usage in Components

### Display User Info

```typescript
import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  template: `
    <header>
      <div *ngIf="userInfo">
        Welcome, {{ userInfo.fullname }}!
        <button (click)="logout()">Logout</button>
      </div>
    </header>
  `
})
export class HeaderComponent {
  authService = inject(AuthService);
  
  get userInfo() {
    return this.authService.getUserInfo();
  }
  
  logout() {
    this.authService.performLogout(); // Redirects to Company app
  }
}
```

### Make API Calls

Tokens are automatically attached by the interceptor:

```typescript
import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-donations',
  template: '<div>Loading...</div>'
})
export class DonationsComponent {
  private http = inject(HttpClient);
  
  ngOnInit() {
    // Token automatically attached by interceptor
    this.http.get(`${environment.donationApiUrl}/Donations`)
      .subscribe(data => console.log(data));
  }
}
```

### Check Authentication Status

```typescript
import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  template: `
    <nav>
      <div *ngIf="isLoggedIn">
        <span>{{ userName }}</span>
      </div>
      <div *ngIf="!isLoggedIn">
        <a href="#" (click)="login()">Login</a>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  authService = inject(AuthService);
  
  get isLoggedIn() {
    return this.authService.isAuthenticated();
  }
  
  get userName() {
    return this.authService.getUserInfo()?.fullname || '';
  }
  
  login() {
    this.authService.redirectToLogin(); // Go to Company app
  }
}
```

---

## 🔄 Complete User Flow

### Scenario 1: Unauthenticated User Accessing Protected Route

```
1. User goes to: https://donation.dev.rcscbs.com/donor-portal
                 ↓
2. authGuard checks for valid token → NOT FOUND
                 ↓
3. Store attempted URL in sessionStorage
                 ↓
4. Redirect to: https://company.dev.rcscbs.com/shared/login?returnUrl=...
                 ↓
5. User logs in on Company app
                 ↓
6. Company app sets domain cookies (.dev.rcscbs.com)
                 ↓
7. Company app redirects back to: https://donation.dev.rcscbs.com/donor-portal
                 ↓
8. authGuard checks token → VALID
                 ↓
9. User accesses donor-portal page
```

### Scenario 2: Authenticated User Making API Call

```
1. Component makes API call: http.get('/api/Donations')
                 ↓
2. AuthInterceptor reads accessToken from cookie
                 ↓
3. Adds header: Authorization: Bearer eyJhbGc...
                 ↓
4. API responds: 200 OK
                 ↓
5. Component receives data
```

### Scenario 3: Token Expired During API Call

```
1. Component makes API call with expired token
                 ↓
2. API responds: 401 Unauthorized
                 ↓
3. AuthInterceptor catches 401 error
                 ↓
4. Gets refreshToken from cookie
                 ↓
5. Calls Company API: POST /auth/refresh
                 ↓
6. Receives new accessToken
                 ↓
7. Updates accessToken in cookie
                 ↓
8. Retries original API call with new token
                 ↓
9. API responds: 200 OK
                 ↓
10. Component receives data (never knew about token refresh)
```

### Scenario 4: Logout

```
1. User clicks Logout button
                 ↓
2. authService.performLogout() called
                 ↓
3. Calls Company API: POST /Auth/SignOut
                 ↓
4. Clears all cookies (domain-wide)
                 ↓
5. Clears localStorage and sessionStorage
                 ↓
6. Redirects to: https://company.dev.rcscbs.com
```

---

## 🧪 Testing Checklist

- [ ] **Access protected route without login** → Redirects to Company app login
- [ ] **Login via Company app** → Can access Donation app
- [ ] **Token refresh on expiration** → Automatic, seamless
- [ ] **API calls include token** → Authorization header present
- [ ] **Logout from Donation app** → Redirects to Company app, clears all cookies
- [ ] **Cross-subdomain token sharing** → Tokens work across company.*, donation.*
- [ ] **Role-based access** → Correct roles can/cannot access certain routes
- [ ] **Return URL after login** → Redirects to originally attempted URL

---

## 🐛 Troubleshooting

### Issue: "Not authenticated" even after Company login

**Possible Causes:**
1. Cookies not domain-scoped correctly in Company app
2. Different domain in development (localhost vs dev.rcscbs.com)

**Solution:**
- Check cookies in DevTools → Application → Cookies
- Ensure cookies have domain: `.dev.rcscbs.com` (with leading dot)
- Use dev domain instead of localhost for testing

### Issue: Infinite redirect loop

**Cause:** Company app and Donation app both redirecting to each other

**Solution:**
- Ensure public routes (e.g., `/home`) don't require authentication
- Check auth guard public routes list

### Issue: Token refresh fails

**Cause:** Company API `/auth/refresh` endpoint not accessible

**Solution:**
- Verify Company API CORS allows Donation app domain
- Check Company API refresh endpoint is functioning
- Verify refresh token is valid

---

## 📚 API Endpoints (Company API)

These endpoints are called by the Donation app:

### Refresh Token
```
POST /api/auth/refresh
Content-Type: application/json

Request:
{
  "refreshToken": "eyJhbGc..."
}

Response (200 OK):
{
  "accessToken": "eyJhbGc..."
}
```

### Sign Out
```
POST /api/Auth/SignOut
Content-Type: application/json
Authorization: Bearer {accessToken}

Request:
{
  "sessionId": "abc-123-def-456",
  "userId": "12345"
}

Response (200 OK)
```

---

## 🎯 Summary

✅ **Donation app consumes tokens from Company app**  
✅ **Tokens shared via domain-scoped cookies**  
✅ **Automatic token refresh using Company API**  
✅ **Redirects to Company app for login/logout**  
✅ **Route guards protect authenticated routes**  
✅ **HTTP interceptor handles token attachment**  

This implementation provides seamless SSO across all subdomain apps in your ecosystem!
