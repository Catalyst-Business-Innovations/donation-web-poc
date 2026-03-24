import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from 'jwt-decode';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RefreshTokenResponse, SignOutRequest, UserInfo, DecodedToken } from '../models/auth.models';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { isSafeRedirectUrl } from '../utils/url-validator';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly cookieService = inject(CookieService);

  /** Cached decoded token — invalidated on setTokens/clearAuthData */
  private cachedUserInfo: UserInfo | null = null;
  private cachedTokenString: string | null = null;

  private isLocalhost(): boolean {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  }

  // ── Token Management ─────────────────────────────────────────────────────

  setTokens(accessToken: string, refreshToken: string, sessionId: string): void {
    if (!accessToken || !refreshToken || !sessionId) {
      if (!environment.production) console.error('setTokens: all token values must be non-empty');
      return;
    }

    this.invalidateCache();

    const opts = this.getCookieOptions();
    this.cookieService.set('accessToken', accessToken, opts);
    this.cookieService.set('refreshToken', refreshToken, opts);
    this.cookieService.set('sessionId', sessionId, opts);
  }

  setAccessToken(accessToken: string): void {
    if (!accessToken) {
      if (!environment.production) console.error('setAccessToken: token must be non-empty');
      return;
    }

    this.invalidateCache();
    this.cookieService.set('accessToken', accessToken, this.getCookieOptions());
  }

  /**
   * Cookie options with security attributes.
   * Secure: only sent over HTTPS (skipped on localhost for dev).
   * SameSite: Lax prevents CSRF while allowing navigation-initiated requests.
   */
  private getCookieOptions(): { path: string; domain?: string; secure: boolean; sameSite: 'Lax' | 'Strict' | 'None' } {
    if (this.isLocalhost()) {
      return { path: '/', secure: false, sameSite: 'Lax' };
    }
    return { path: '/', domain: `.${environment.domainName}`, secure: true, sameSite: 'Lax' };
  }

  getAccessToken(): string | null {
    return this.cookieService.get('accessToken') || null;
  }

  getRefreshToken(): string | null {
    return this.cookieService.get('refreshToken') || null;
  }

  getSessionId(): string | null {
    return this.cookieService.get('sessionId') || null;
  }

  // ── Token Decoding ───────────────────────────────────────────────────────

  decodeToken(token: string): DecodedToken | null {
    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      if (!environment.production) console.error('Invalid token', error);
      return null;
    }
  }

  /**
   * Get user info from current JWT token.
   * Caches the decoded result to avoid repeated base64 decoding.
   */
  getUserInfo(): UserInfo | null {
    const token = this.getAccessToken();
    if (!token) {
      this.cachedUserInfo = null;
      this.cachedTokenString = null;
      return null;
    }

    // Return cached if token hasn't changed
    if (token === this.cachedTokenString && this.cachedUserInfo) {
      return this.cachedUserInfo;
    }

    this.cachedTokenString = token;
    const decoded = this.decodeToken(token);
    this.cachedUserInfo = decoded ? this.toUserInfo(decoded) : null;
    return this.cachedUserInfo;
  }

  // ── Authentication Check ─────────────────────────────────────────────────

  /**
   * Check if user has a valid, non-expired JWT.
   * Includes a 10-second buffer before expiry to allow proactive refresh.
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    const decoded = this.decodeToken(token);
    if (!decoded?.exp) return false;

    const expirationTime = decoded.exp * 1000;
    return Date.now() < expirationTime - 10000;
  }

  // ── Session Cleanup ──────────────────────────────────────────────────────

  /**
   * Clear all authentication data — cookies, localStorage, sessionStorage.
   * Only removes auth-related keys, not unrelated app state.
   */
  clearAuthData(): void {
    this.invalidateCache();

    // Clear auth-related storage keys only
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    sessionStorage.removeItem(STORAGE_KEYS.STAFF_RETURN_URL);
    sessionStorage.removeItem(STORAGE_KEYS.DONOR_RETURN_URL);

    // Delete auth cookies
    if (this.isLocalhost()) {
      this.cookieService.delete('accessToken', '/');
      this.cookieService.delete('refreshToken', '/');
      this.cookieService.delete('sessionId', '/');
    } else {
      const domain = `.${environment.domainName}`;
      this.cookieService.delete('accessToken', '/', domain);
      this.cookieService.delete('refreshToken', '/', domain);
      this.cookieService.delete('sessionId', '/', domain);
      this.cookieService.delete('accessToken', '/', environment.domainName);
      this.cookieService.delete('refreshToken', '/', environment.domainName);
      this.cookieService.delete('sessionId', '/', environment.domainName);
    }

    // Fallback: clear all cookies on this path
    this.cookieService.deleteAll('/');
  }

  // ── Company App Integration (production) ─────────────────────────────────

  /**
   * Redirect to Company app login.
   * Used in production when SSO is integrated.
   */
  redirectToLogin(): void {
    const currentUrl = window.location.href;
    const returnUrl = isSafeRedirectUrl(currentUrl) ? currentUrl : '/';
    const loginUrl = `${environment.companyUrl}/shared/login?returnUrl=${encodeURIComponent(returnUrl)}`;
    window.location.href = loginUrl;
  }

  refreshAccessToken(refreshToken: string): Observable<RefreshTokenResponse> {
    const url = `${environment.companyApiUrl}/auth/refresh`;
    return this.http.post<RefreshTokenResponse>(url, { refreshToken });
  }

  logout(userDetails: SignOutRequest): Observable<unknown> {
    const url = `${environment.companyApiUrl}/Auth/SignOut`;
    return this.http.post(url, userDetails);
  }

  /**
   * Full logout — calls Company API to invalidate server session,
   * clears local data, then redirects. For production use.
   */
  performLogout(): void {
    const sessionId = this.getSessionId();
    const userId = this.getUserInfo()?.userid;

    this.clearAuthData();

    if (sessionId) {
      this.logout({ sessionId, userId }).subscribe({
        error: (err) => { if (!environment.production) console.error('Logout API error:', err); },
      });
    }
  }

  /**
   * Safely convert a decoded token to UserInfo.
   * Validates that required fields exist rather than using an unsafe cast.
   */
  private toUserInfo(decoded: DecodedToken): UserInfo | null {
    if (!decoded.exp || !decoded.iat || !decoded.nbf) return null;
    return {
      userid: decoded.userid ?? '',
      companyid: decoded.companyid ?? '',
      email: decoded.email ?? '',
      fullname: decoded.fullname ?? '',
      role: decoded.role ?? '',
      phonenumber: decoded.phonenumber,
      exp: decoded.exp,
      iat: decoded.iat,
      nbf: decoded.nbf,
      iss: decoded.iss ?? '',
    };
  }

  private invalidateCache(): void {
    this.cachedUserInfo = null;
    this.cachedTokenString = null;
  }
}
