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
        switch (error.status) {
          case 401:
            return handle401(req, next, authService, toastService, router);
          case 403:
            toastService.error('Access denied. You do not have permission to access this resource.');
            break;
          case 400: {
            const rawMsg = error.error?.message;
            const msg = typeof rawMsg === 'string'
              ? (rawMsg.length > 200 ? rawMsg.substring(0, 200) + '...' : rawMsg)
              : 'The request could not be processed. Please check your input and try again.';
            toastService.error(msg);
            break;
          }
          case 404:
            toastService.error('The requested resource was not found.');
            break;
          case 500:
            toastService.error('A server error occurred. Please try again later.');
            break;
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
