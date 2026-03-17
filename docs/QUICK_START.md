# Quick Start Guide - Token Sharing (Token Consumption)

## 🔄 Important: This App CONSUMES Tokens

The Donation app **does not handle login**. Users login to the **Company app**, and tokens are shared via domain-scoped cookies.

```
Company App (Login) → Domain Cookies → Donation App (Reads Tokens)
```

---

## 🎯 What's Already Configured

✅ **Environment files** with Company app URLs  
✅ **Auth service** reads tokens from cookies  
✅ **HTTP interceptor** auto-attaches tokens to API requests  
✅ **Auth guards** redirect to Company app login if not authenticated  
✅ **Token refresh** uses Company API  
✅ **Logout** redirects to Company app  

---

## 📋 Setup Checklist

### 1. Verify Environment Configuration

The environment files should already have Company app URLs configured:

**`src/environments/environment.ts`**
```typescript
{
  domainName: 'dev.rcscbs.com',
  companyUrl: 'https://company.dev.rcscbs.com',
  companyApiUrl: 'https://company-api.dev.rcscbs.com/api',
  donationApiUrl: 'https://donation-api.dev.rcscbs.com/api',
}
```

✅ **Already configured** - No action needed!

### 2. Add Login Route

Update your `src/app/app.routes.ts`:

```typescript
import { Routes } from '@angular/router';
import { LoginComponent } from './shared/components/login/login.component';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Public routes
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  
  // Protected routes - require authentication
  {
    path: 'donor-portal',
    canActivate: [authGuard],
    loadChildren: () => import('./modules/donor-portal/donor-portal.routes')
  },
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

### 3. Test Authentication

Start your development server:
```bash
npm start
```

Navigate to: `http://localhost:4200/login`

---

## 🔌 Backend API Integration Requirements

Your backend must implement these endpoints:

### Login Endpoint
```
POST /api/Auth/SignIn
Content-Type: application/json

Request Body:
{
  "userName": "user@example.com",
  "password": "SecurePassword123"
}

Expected Response (200 OK):
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionId": "unique-session-id"
}

JWT Payload should contain:
{
  "userid": "12345",
  "companyid": "1",
  "email": "user@example.com",
  "fullname": "John Doe",
  "role": "Admin",
  "exp": 1711234567,
  ...
}
```

### Token Refresh Endpoint
```
POST /api/auth/refresh
Content-Type: application/json

Request Body:
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Expected Response (200 OK):
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Logout Endpoint
```
POST /api/Auth/SignOut
Content-Type: application/json
Authorization: Bearer {accessToken}

Request Body:
{
  "sessionId": "unique-session-id",
  "userId": "12345"
}

Expected Response (200 OK)
```

---

## 📝 Common Usage Examples

### Example 1: Display User Info in Component

```typescript
import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  template: `
    <header>
      <div *ngIf="userInfo">
        Welcome, {{ userInfo.fullname }}
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
    this.authService.performLogout();
  }
}
```

### Example 2: Make Authenticated API Call

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-donations',
  template: '<div>Loading donations...</div>'
})
export class DonationsComponent implements OnInit {
  private http = inject(HttpClient);
  donations: any[] = [];
  
  ngOnInit() {
    // Token is automatically attached by the interceptor
    this.http.get(`${environment.donationApiUrl}/Donations`)
      .subscribe(data => {
        this.donations = data as any[];
      });
  }
}
```

### Example 3: Check Authentication in Component

```typescript
import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  template: `
    <nav>
      <a *ngIf="!isLoggedIn" routerLink="/login">Login</a>
      <button *ngIf="isLoggedIn" (click)="logout()">Logout</button>
    </nav>
  `
})
export class NavbarComponent {
  authService = inject(AuthService);
  router = inject(Router);
  
  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }
  
  logout() {
    this.authService.performLogout();
  }
}
```

---

## 🧪 Testing Checklist

Before deploying, test these scenarios:

- [ ] **Login with valid credentials** - Should redirect to dashboard
- [ ] **Login with invalid credentials** - Should show error message
- [ ] **Access protected route without login** - Should redirect to home/login
- [ ] **Token refresh on 401** - Should automatically refresh and retry request
- [ ] **Logout** - Should clear all data and redirect to home
- [ ] **Role-based access** - Admin routes blocked for non-admin users
- [ ] **Session persistence** - Refresh page should maintain login state
- [ ] **Token expiration** - Should logout when token expires

---

## 🐛 Quick Troubleshooting

### Problem: "Cannot read property 'accessToken'"
**Solution:** Backend not returning proper response. Check API response format.

### Problem: "401 Unauthorized on every request"
**Solution:** Check if token is being stored. Open DevTools > Application > Cookies.

### Problem: "Infinite redirect loop"
**Solution:** Check auth guard configuration and ensure public routes are excluded.

### Problem: "CORS error"
**Solution:** Configure CORS on backend to allow your frontend domain.

---

## 📞 Support

For detailed documentation, see: [TOKEN_SHARING_DONATION_APP.md](./TOKEN_SHARING_DONATION_APP.md)

For the original reference implementation, see: [TOKEN_SHARING_IMPLEMENTATION.md](./TOKEN_SHARING_IMPLEMENTATION.md)

---

## ✅ What's Already Implemented

✅ Packages installed (ngx-cookie-service, jwt-decode)  
✅ Environment configurations with Company app URLs  
✅ Auth service (reads tokens from cookies)  
✅ HTTP interceptor (auto-attaches tokens, refreshes on 401)  
✅ Auth guards (redirect to Company app login)  
✅ Login redirect component  
✅ App config with providers  

**You're ready to consume tokens from Company app!** 🎉
