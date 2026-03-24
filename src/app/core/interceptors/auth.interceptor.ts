import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { throwError, BehaviorSubject, timeout } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

const REQUEST_TIMEOUT_MS = 30_000;
const PUBLIC_ROUTES = ['/assets/', '/home'];

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

/**
 * Functional HTTP interceptor — Angular 20 pattern.
 * Attaches Bearer token, handles 401 refresh, portal-aware redirect, 30s timeout.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (PUBLIC_ROUTES.some(route => req.url.includes(route))) {
    return next(req);
  }

  // inject() must be called at the top level of the interceptor function
  const authService = inject(AuthService);
  const toastService = inject(ToastService);
  const router = inject(Router);

  const token = authService.getAccessToken();
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    timeout(REQUEST_TIMEOUT_MS),
    catchError((error: HttpErrorResponse | Error) => {
      if (error.name === 'TimeoutError') {
        toastService.error('Request timed out. Please try again.');
        return throwError(() => error);
      }

      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          return handle401(req, next, authService, toastService, router);
        } else if (error.status >= 400 && error.status < 500) {
          // Client errors (400, 403, 404, 422, etc.) — show the API message to the user.
          // These are intentional responses (validation errors, not found, forbidden).
          toastService.error(extractClientErrorMessage(error));
        } else if (error.status >= 500) {
          // Server errors (500, 502, 503, etc.) — never show raw API internals.
          toastService.error('A server error occurred. Please try again later.');
        }
      }

      return throwError(() => error);
    })
  );
};

function handle401(
  req: Parameters<HttpInterceptorFn>[0],
  next: Parameters<HttpInterceptorFn>[1],
  authService: AuthService,
  toastService: ToastService,
  router: Router
) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = authService.getRefreshToken();

    if (refreshToken && !refreshToken.startsWith('refresh-')) {
      return authService.refreshAccessToken(refreshToken).pipe(
        switchMap(response => {
          isRefreshing = false;
          authService.setAccessToken(response.accessToken);
          refreshTokenSubject.next(response.accessToken);
          return next(req.clone({ setHeaders: { Authorization: `Bearer ${response.accessToken}` } }));
        }),
        catchError(err => {
          isRefreshing = false;
          doRedirectToLogin(authService, toastService, router);
          return throwError(() => err);
        })
      );
    } else {
      isRefreshing = false;
      doRedirectToLogin(authService, toastService, router);
      return throwError(() => new Error('Session expired'));
    }
  } else {
    return refreshTokenSubject.pipe(
      filter(t => t !== null),
      take(1),
      switchMap(t => next(req.clone({ setHeaders: { Authorization: `Bearer ${t!}` } })))
    );
  }
}

function doRedirectToLogin(authService: AuthService, toastService: ToastService, router: Router): void {
  authService.clearAuthData();
  toastService.error('Your session has expired. Please log in again.');
  router.navigate([router.url.startsWith('/donor') ? '/donor/login' : '/staff/login']);
}

/**
 * Extract a user-facing message from a client error (4xx) response.
 * The API is expected to return meaningful messages for client errors
 * (validation failures, not found, forbidden, etc.).
 */
function extractClientErrorMessage(error: HttpErrorResponse): string {
  // Try error.error.message (standard API format)
  if (typeof error.error?.message === 'string' && error.error.message.trim()) {
    return error.error.message;
  }

  // Try error.error as a plain string
  if (typeof error.error === 'string' && error.error.trim()) {
    return error.error;
  }

  // Try error.error.errors (validation error array — e.g., 422)
  if (Array.isArray(error.error?.errors)) {
    const messages = error.error.errors
      .map((e: { message?: string }) => e.message)
      .filter(Boolean);
    if (messages.length > 0) return messages.join('. ');
  }

  // Fallback per status code
  switch (error.status) {
    case 400: return 'The request could not be processed. Please check your input.';
    case 403: return 'Access denied. You do not have permission to access this resource.';
    case 404: return 'The requested resource was not found.';
    case 409: return 'A conflict occurred. The resource may have been modified.';
    case 422: return 'Validation failed. Please check your input.';
    case 429: return 'Too many requests. Please try again later.';
    default:  return `Request failed (${error.status}). Please try again.`;
  }
}
