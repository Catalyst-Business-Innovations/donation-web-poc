# Token Sharing Implementation Guide - Donation Web App

## Overview

This implementation provides a complete authentication system with JWT token management, HTTP interceptors, and route guards. The system uses **HTTP-only cookies with domain-level sharing** to enable Single Sign-On (SSO) across multiple subdomains.

---

## ✅ What Has Been Implemented

### 1. **Package Installation**
- ✅ `ngx-cookie-service@20.0.1` - Cookie management
- ✅ `jwt-decode@4.0.0` - JWT token decoding

### 2. **Environment Configuration**
Created three environment files:
- ✅ `environment.ts` - Development (localhost + dev.rcscbs.com)
- ✅ `environment.stg.ts` - Staging (stg.rcscbs.com)
- ✅ `environment.prd.ts` - Production (brijjworks.com)

### 3. **Core Authentication Files**

#### Models (`src/app/core/models/auth.models.ts`)
- ✅ `LoginRequest` - Login credentials
- ✅ `LoginResponse` - Login API response
- ✅ `RefreshTokenRequest/Response` - Token refresh
- ✅ `SignOutRequest` - Logout request
- ✅ `UserInfo` - Decoded JWT user information

#### Auth Service (`src/app/core/services/auth.service.ts`)
- ✅ `login()` - User authentication
- ✅ `refreshAccessToken()` - Token refresh
- ✅ `logout()` - User logout
- ✅ `setTokens()` - Store tokens in cookies (domain-scoped)
- ✅ `getAccessToken()` - Retrieve access token
- ✅ `getRefreshToken()` - Retrieve refresh token
- ✅ `decodeToken()` - Decode JWT token
- ✅ `getUserInfo()` - Get user info from token
- ✅ `isAuthenticated()` - Check authentication status
- ✅ `clearAuthData()` - Clear all auth data
- ✅ `performLogout()` - Complete logout flow

#### HTTP Interceptor (`src/app/core/interceptors/auth.interceptor.ts`)
- ✅ Automatically attaches access token to API requests
- ✅ Handles 401 errors with automatic token refresh
- ✅ Queues requests during token refresh
- ✅ Handles error responses (401, 403, 400, 404, 500)
- ✅ Shows appropriate error messages via toast service

#### Auth Guards (`src/app/core/guards/auth.guard.ts`)
- ✅ `authGuard` - Protects routes requiring authentication
- ✅ `roleGuard` - Protects routes based on user roles
- ✅ Stores attempted URL for post-login redirect

### 4. **App Configuration**
- ✅ Updated `app.config.ts` with HttpClient and AuthInterceptor providers

### 5. **Example Login Component**
- ✅ Complete login component with form handling
- ✅ Token storage and user info management
- ✅ Role-based navigation
- ✅ Styled login page

---

## 🚀 How to Use

### 1. Protect Routes with Auth Guard

```typescript
// In your routes file (e.g., app.routes.ts)
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Public route
  { path: 'home', component: HomeComponent },
  
  // Protected route (requires authentication)
  { 
    path: 'donor-portal', 
    component: DonorPortalComponent,
    canActivate: [authGuard]
  },
  
  // Protected route with role check
  { 
    path: 'admin-dashboard', 
    component: AdminDashboardComponent,
    canActivate: [roleGuard],
    data: { roles: ['admin'] }
  },
  
  // Protected route with multiple roles
  { 
    path: 'staff-operations', 
    component: StaffOperationsComponent,
    canActivate: [roleGuard],
    data: { roles: ['admin', 'staff'] }
  }
];
```

### 2. Use Auth Service in Components

```typescript
import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  template: `
    <div>
      <h1>Welcome, {{ userInfo?.fullname }}</h1>
      <button (click)="logout()">Logout</button>
    </div>
  `
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  userInfo = this.authService.getUserInfo();
  
  logout(): void {
    this.authService.performLogout();
  }
}
```

### 3. Make Authenticated API Calls

The HTTP interceptor automatically attaches tokens, so just use HttpClient normally:

```typescript
import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-donations',
  template: `<div>Donations List</div>`
})
export class DonationsComponent {
  private http = inject(HttpClient);
  
  ngOnInit(): void {
    // Token is automatically attached by the interceptor
    this.http.get(`${environment.donationApiUrl}/Donations`)
      .subscribe(data => {
        console.log('Donations:', data);
      });
  }
}
```

### 4. Check Authentication Status

```typescript
import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  template: `
    <nav>
      <div *ngIf="isAuthenticated">
        <span>Welcome, {{ userName }}</span>
        <button (click)="logout()">Logout</button>
      </div>
      <div *ngIf="!isAuthenticated">
        <button routerLink="/login">Login</button>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  private authService = inject(AuthService);
  
  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
  
  get userName(): string {
    return this.authService.getUserInfo()?.fullname || '';
  }
  
  logout(): void {
    this.authService.performLogout();
  }
}
```

---

## 🔧 Token Flow Diagrams

### Login Flow
```
User enters credentials
       ↓
LoginComponent.onLogin()
       ↓
AuthService.login()
       ↓
API: POST /api/Auth/SignIn
       ↓
Response with tokens
       ↓
AuthService.setTokens()
  → Store in cookies (domain-scoped)
       ↓
AuthService.setUserInfo()
  → Store in localStorage
       ↓
Navigate to dashboard
```

### API Request Flow with Auto Token Refresh
```
Component makes API call
       ↓
HttpClient request
       ↓
AuthInterceptor.intercept()
       ↓
Get accessToken from cookie
       ↓
Add Authorization: Bearer {token}
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
│    ↓                        │
│  Return response            │
└─────────────────────────────┘
```

### Logout Flow
```
User clicks logout
       ↓
AuthService.performLogout()
       ↓
Get sessionId from cookie
       ↓
API: POST /api/Auth/SignOut
       ↓
AuthService.clearAuthData()
  → Clear localStorage
  → Clear sessionStorage
  → Delete all cookies (domain-wide)
       ↓
Navigate to home page
```

---

## 🌐 Environment Setup

### Update Angular.json for Environment-Specific Builds

Add to `angular.json` under `projects.brijjworks-donation-app.architect.build.configurations`:

```json
{
  "configurations": {
    "production": {
      "fileReplacements": [
        {
          "replace": "src/environments/environment.ts",
          "with": "src/environments/environment.prd.ts"
        }
      ]
    },
    "staging": {
      "fileReplacements": [
        {
          "replace": "src/environments/environment.ts",
          "with": "src/environments/environment.stg.ts"
        }
      ]
    },
    "development": {
      "optimization": false,
      "extractLicenses": false,
      "sourceMap": true
    }
  }
}
```

### Build Commands

```bash
# Development
npm run start

# Staging build
ng build --configuration=staging

# Production build
ng build --configuration=production
```

---

## 🔒 Security Considerations

### Current Implementation
- ✅ Tokens stored in cookies (not localStorage)
- ✅ Domain-scoped cookies for SSO
- ✅ Automatic token refresh on 401
- ✅ Bearer token in Authorization header
- ⚠️ Cookie flags (Secure, HttpOnly, SameSite) should be set server-side

### Backend Requirements

Your API should set the following cookie attributes:
- `HttpOnly` - Prevents JavaScript access to cookies
- `Secure` - Only send over HTTPS in production
- `SameSite=Strict` or `SameSite=Lax` - CSRF protection

---

## 📋 Backend API Requirements

### Required Endpoints

#### 1. Sign In
```
POST /api/Auth/SignIn
Content-Type: application/json

Request:
{
  "userName": "user@example.com",
  "password": "password123"
}

Response (200 OK):
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "sessionId": "abc-123-def-456"
}
```

#### 2. Refresh Token
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

#### 3. Sign Out
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

### JWT Token Claims

Your backend JWT should include these claims:
```json
{
  "userid": "12345",
  "companyid": "1",
  "email": "user@example.com",
  "fullname": "John Doe",
  "role": "Admin",
  "phonenumber": "+1234567890",
  "exp": 1234567890,
  "iat": 1234567890,
  "nbf": 1234567890,
  "iss": "DonationAPI"
}
```

---

## 🧪 Testing Checklist

- [ ] Test login with valid credentials
- [ ] Test login with invalid credentials
- [ ] Test automatic token refresh on API 401
- [ ] Test logout clears all data
- [ ] Test route guard redirects unauthenticated users
- [ ] Test role guard blocks unauthorized roles
- [ ] Test token expiration handling
- [ ] Test cross-subdomain cookie sharing (dev/staging/prod)
- [ ] Test "remember me" redirect after login

---

## 🐛 Troubleshooting

### Tokens not shared across subdomains
**Cause:** Domain not configured correctly in cookies  
**Solution:** 
- Check `environment.domainName` is correct
- Ensure cookies are set with leading dot: `.dev.rcscbs.com`
- Verify you're not on localhost (use dev domain)

### Infinite refresh loop
**Cause:** Refresh token also expired  
**Solution:** Check token expiration times in JWT payload

### 401 errors not triggering refresh
**Cause:** Interceptor not registered  
**Solution:** Verify `AuthInterceptor` is in `app.config.ts` providers

### User redirected to home unexpectedly
**Cause:** Token expired or invalid  
**Solution:** 
- Check token in browser DevTools > Application > Cookies
- Verify token hasn't expired (check `exp` claim)
- Ensure API returns proper JWT format

---

## 📁 File Structure

```
src/app/
├── core/
│   ├── guards/
│   │   └── auth.guard.ts
│   ├── interceptors/
│   │   └── auth.interceptor.ts
│   ├── models/
│   │   ├── auth.models.ts
│   │   └── domain.models.ts
│   └── services/
│       ├── auth.service.ts
│       ├── mock-data.service.ts
│       └── toast.service.ts
├── shared/
│   └── components/
│       └── login/
│           ├── login.component.ts
│           ├── login.component.html
│           └── login.component.scss
├── app.config.ts
└── app.routes.ts

src/environments/
├── environment.ts       (Development)
├── environment.stg.ts   (Staging)
└── environment.prd.ts   (Production)
```

---

## 🎯 Next Steps

1. **Update Backend API URLs** in environment files to match your actual API endpoints
2. **Configure CORS** on your backend to allow requests from your frontend domains
3. **Add Login Route** to `app.routes.ts`:
   ```typescript
   { path: 'login', component: LoginComponent }
   ```
4. **Add Auth Guards** to protected routes
5. **Test Authentication Flow** end-to-end
6. **Implement Role-Based Access Control** for different user types
7. **Add "Forgot Password"** functionality
8. **Add "Remember Me"** functionality (optional)

---

## 📚 Additional Resources

- [JWT.io](https://jwt.io/) - Decode and verify JWT tokens
- [ngx-cookie-service Documentation](https://github.com/stevermeister/ngx-cookie-service)
- [Angular HTTP Interceptors](https://angular.io/guide/http-intercept-requests-and-responses)
- [Angular Route Guards](https://angular.io/guide/router#preventing-unauthorized-access)

---

## 💡 Tips

1. **Development with Localhost**: The system automatically detects localhost and uses path-only cookies
2. **Debugging Tokens**: Use browser DevTools > Application > Cookies to inspect tokens
3. **Token Expiration**: Keep access tokens short-lived (5-15 minutes) and refresh tokens longer (7-30 days)
4. **HTTPS Required**: In production, ensure HTTPS is enabled for secure cookie transmission
5. **Session Storage**: The `redirectUrl` feature stores the URL user tried to access before login

---

## ✨ Summary

The token sharing authentication system is now fully implemented and ready to use. Follow the "How to Use" section to integrate authentication into your components and routes. The system handles token management, refresh, and logout automatically, providing a seamless SSO experience across subdomains.
