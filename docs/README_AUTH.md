# Token Sharing Authentication System

## 📋 Overview

JWT-based authentication system where the Donation app **consumes tokens** from the Company app for SSO (Single Sign-On) across subdomains.

## 🔄 Authentication Flow

```
Company App (Login) → Domain Cookies (.dev.rcscbs.com) → Donation App (Reads Tokens)
```

**Key Point:** This app **does NOT handle login**. Users login via Company app, and tokens are shared through domain-scoped cookies.

## 🎯 Features

- ✅ Token consumption from Company app
- ✅ Domain-scoped cookies for cross-subdomain SSO
- ✅ Automatic token refresh via Company API
- ✅ HTTP interceptor for automatic token attachment
- ✅ Route guards for protected routes
- ✅ Role-based access control
- ✅ Redirect to Company app for login/logout
- ✅ Seamless token refresh handling

## 🚀 Quick Start

See [QUICK_START.md](./QUICK_START.md) for immediate setup steps.

See [TOKEN_SHARING_DONATION_APP.md](./TOKEN_SHARING_DONATION_APP.md) for detailed documentation.

## 📦 Components

### Core Services
- **AuthService** - Token reading, validation, user info extraction
- **AuthInterceptor** - Automatic token attachment and refresh
- **Auth Guards** - Route protection and role-based access

### Key Methods
- `redirectToLogin()` - Redirect to Company app login
- `getAccessToken()` - Read token from domain cookie
- `refreshAccessToken()` - Refresh via Company API
- `performLogout()` - Logout and redirect to Company app

### Example Components
- **LoginComponent** - Redirects to Company app (no local login form)

## 🔐 Security Features

- Tokens stored in domain-scoped cookies (set by Company app)
- Automatic token refresh via Company API
- Secure logout with domain-wide cleanup
- Bearer token authorization
- Redirect to Company app for authentication

## 📚 Documentation

- **TOKEN_SHARING_DONATION_APP.md** - Complete implementation guide (START HERE)
- **QUICK_START.md** - Quick setup guide
- **TOKEN_SHARING_IMPLEMENTATION.md** - Original reference from Company app
- **AUTHENTICATION_IMPLEMENTATION.md** - General auth docs (legacy)

## 🛠️ Tech Stack

- Angular 20
- ngx-cookie-service 20.0.1
- jwt-decode 4.0.0
- RxJS 7.8.0

## 👥 Usage Example

```typescript
// In your component
import { Component, inject } from '@angular/core';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <div *ngIf="userInfo">
      <h1>Welcome, {{ userInfo.fullname }}</h1>
      <button (click)="logout()">Logout</button>
    <div *ngIf="!isAuthenticated">
      <button (click)="login()">Login via Company Portal</button>
    </div>
  `
})
export class DashboardComponent {
  authService = inject(AuthService);
  
  get userInfo() {
    return this.authService.getUserInfo(); // Read from cookie
  }
  
  get isAuthenticated() {
    return this.authService.isAuthenticated();
  }
  
  login() {
    this.authService.redirectToLogin(); // Redirect to Company app
  }
  
  logout() {
    this.authService.performLogout(); // Logout via Company API
  }
}
```

## 🔗 Integration

1. ✅ Environment files configured with Company app URLs
2. ✅ Auth service reads tokens from cookies (set by Company app)
3. ✅ Protect routes with auth guards
4. ✅ Use AuthService in components
5. ✅ Make API calls (tokens attached automatically)
6. ✅ Redirects to Company app for login/logout
5. Make API calls (tokens attached automatically)

## 📝 License

Copyright © 2026 Brijjworks
