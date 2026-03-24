import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject, timeout } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/** Default request timeout in milliseconds (30 seconds) */
const REQUEST_TIMEOUT_MS = 30_000;

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  private readonly PUBLIC_ROUTES = ['/assets/', '/home'];

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (this.isPublicRoute(req.url)) {
      return next.handle(req);
    }

    const token = this.authService.getAccessToken();
    if (token) {
      req = this.addAuthHeader(req, token);
    }

    return next.handle(req).pipe(
      timeout(REQUEST_TIMEOUT_MS),
      catchError((error: HttpErrorResponse | Error) => {
        if (error.name === 'TimeoutError') {
          this.toastService.error('Request timed out. Please try again.');
          return throwError(() => error);
        }

        if (error instanceof HttpErrorResponse) {
          if (error.status === 401) {
            return this.handle401Error(req, next);
          } else if (error.status === 403) {
            this.toastService.error('Access denied. You do not have permission to access this resource.');
          } else if (error.status === 400) {
            this.handleBadRequestError(error);
          } else if (error.status === 404) {
            this.toastService.error('The requested resource was not found.');
          } else if (error.status === 500) {
            this.toastService.error('A server error occurred. Please try again later.');
          }
        }

        return throwError(() => error);
      })
    );
  }

  private addAuthHeader(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  /**
   * Handle 401 — attempt token refresh, or redirect to the appropriate login page.
   */
  private handle401Error(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.authService.getRefreshToken();

      if (refreshToken && !refreshToken.startsWith('refresh-')) {
        // Real refresh token — attempt refresh via Company API (production)
        return this.authService.refreshAccessToken(refreshToken).pipe(
          switchMap(response => {
            this.isRefreshing = false;
            this.authService.setAccessToken(response.accessToken);
            this.refreshTokenSubject.next(response.accessToken);
            return next.handle(this.addAuthHeader(req, response.accessToken));
          }),
          catchError(err => {
            this.isRefreshing = false;
            this.redirectToLogin('Your session has expired. Please log in again.');
            return throwError(() => err);
          })
        );
      } else {
        // Dev mock token or no refresh token — redirect to login
        this.isRefreshing = false;
        this.redirectToLogin('Your session has expired. Please log in again.');
        return throwError(() => new Error('Session expired'));
      }
    } else {
      // Refresh already in progress — queue and retry when new token arrives
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => next.handle(this.addAuthHeader(req, token!)))
      );
    }
  }

  /**
   * Redirect to the appropriate login page based on the current URL path.
   * Staff routes → /staff/login, Donor routes → /donor/login.
   */
  private redirectToLogin(message: string): void {
    this.authService.clearAuthData();
    this.toastService.error(message);

    const currentUrl = this.router.url;
    if (currentUrl.startsWith('/donor')) {
      this.router.navigate(['/donor/login']);
    } else {
      this.router.navigate(['/staff/login']);
    }
  }

  private handleBadRequestError(error: HttpErrorResponse): void {
    const rawMessage = error.error?.message;
    if (rawMessage && typeof rawMessage === 'string') {
      const sanitized = rawMessage.length > 200 ? rawMessage.substring(0, 200) + '...' : rawMessage;
      this.toastService.error(sanitized);
    } else {
      this.toastService.error('The request could not be processed. Please check your input and try again.');
    }
  }

  private isPublicRoute(url: string): boolean {
    return this.PUBLIC_ROUTES.some(route => url.includes(route));
  }
}
