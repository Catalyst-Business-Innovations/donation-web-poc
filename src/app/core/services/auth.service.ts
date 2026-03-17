import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from 'jwt-decode';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RefreshTokenResponse, SignOutRequest, UserInfo, DecodedToken } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private cookieService = inject(CookieService);

  /**
   * Redirect to Company app login
   * This app doesn't handle login - users login via Company app
   */
  redirectToLogin(): void {
    const currentUrl = window.location.href;
    const loginUrl = `${environment.companyUrl}/shared/login?returnUrl=${encodeURIComponent(currentUrl)}`;
    window.location.href = loginUrl;
  }

  /**
   * Refresh access token using Company API
   */
  refreshAccessToken(refreshToken: string): Observable<RefreshTokenResponse> {
    const url = `${environment.companyApiUrl}/auth/refresh`;
    return this.http.post<RefreshTokenResponse>(url, { refreshToken });
  }

  /**
   * Logout user via Company API
   */
  logout(userDetails: SignOutRequest): Observable<any> {
    const url = `${environment.companyApiUrl}/Auth/SignOut`;
    return this.http.post(url, userDetails);
  }

  /**
   * Note: Tokens are set by Company app, not this app
   * This method is kept for completeness but should rarely be used
   * Tokens are shared via domain-scoped cookies set by Company app
   */
  setTokens(accessToken: string, refreshToken: string, sessionId: string): void {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (isLocalhost) {
      this.cookieService.set('accessToken', accessToken, { path: '/' });
      this.cookieService.set('refreshToken', refreshToken, { path: '/' });
      this.cookieService.set('sessionId', sessionId, { path: '/' });
    } else {
      // Use domain-scoped cookies for cross-subdomain authentication
      const domain = `.${environment.domainName}`;
      this.cookieService.set('accessToken', accessToken, { path: '/', domain });
      this.cookieService.set('refreshToken', refreshToken, { path: '/', domain });
      this.cookieService.set('sessionId', sessionId, { path: '/', domain });
    }
  }

  /**
   * Get access token from cookie
   */
  getAccessToken(): string | null {
    return this.cookieService.get('accessToken') || null;
  }

  /**
   * Get refresh token from cookie
   */
  getRefreshToken(): string | null {
    return this.cookieService.get('refreshToken') || null;
  }

  /**
   * Get session ID from cookie
   */
  getSessionId(): string | null {
    return this.cookieService.get('sessionId') || null;
  }

  /**
   * Update access token in cookie
   */
  setAccessToken(accessToken: string): void {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (isLocalhost) {
      this.cookieService.set('accessToken', accessToken, { path: '/' });
    } else {
      const domain = `.${environment.domainName}`;
      this.cookieService.set('accessToken', accessToken, { path: '/', domain });
    }
  }

  /**
   * Decode JWT token
   */
  decodeToken(token: string): DecodedToken | null {
    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error('Invalid token', error);
      return null;
    }
  }

  /**
   * Get user info from token
   */
  getUserInfo(): UserInfo | null {
    const token = this.getAccessToken();
    if (!token) {
      return null;
    }
    return this.decodeToken(token) as UserInfo | null;
  }

  /**
   * Store user info in localStorage
   */
  setUserInfo(userInfo: UserInfo): void {
    localStorage.setItem('user', JSON.stringify(userInfo));
  }

  /**
   * Get user info from localStorage
   */
  getUserInfoFromStorage(): UserInfo | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return null;
    }
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user info from storage', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) {
      return false;
    }

    // Check if token is expired
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded['exp']) {
      return false;
    }

    const expirationTime = decoded['exp'] * 1000; // Convert to milliseconds
    return Date.now() < expirationTime;
  }

  /**
   * Clear all authentication data
   */
  clearAuthData(): void {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // Clear localStorage
    localStorage.removeItem('user');
    sessionStorage.clear();

    // Delete cookies
    if (isLocalhost) {
      this.cookieService.delete('accessToken', '/');
      this.cookieService.delete('refreshToken', '/');
      this.cookieService.delete('sessionId', '/');
    } else {
      const domain = `.${environment.domainName}`;
      this.cookieService.delete('accessToken', '/', domain);
      this.cookieService.delete('refreshToken', '/', domain);
      this.cookieService.delete('sessionId', '/', domain);

      // Also try without leading dot
      this.cookieService.delete('accessToken', '/', environment.domainName);
      this.cookieService.delete('refreshToken', '/', environment.domainName);
      this.cookieService.delete('sessionId', '/', environment.domainName);
    }

    // Delete all cookies as fallback
    this.cookieService.deleteAll('/');
  }

  /**
   * Perform full logout and redirect to Company app
   */
  performLogout(): void {
    const sessionId = this.getSessionId();
    const userId = this.getUserInfo()?.userid;

    if (sessionId) {
      this.logout({ sessionId, userId }).subscribe({
        next: () => {
          this.clearAuthData();
          // Redirect to Company app after logout
          window.location.href = environment.companyUrl;
        },
        error: error => {
          console.error('Logout error:', error);
          // Clear data even if API call fails
          this.clearAuthData();
          window.location.href = environment.companyUrl;
        }
      });
    } else {
      this.clearAuthData();
      window.location.href = environment.companyUrl;
    }
  }
}
