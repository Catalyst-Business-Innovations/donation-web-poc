import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  // Routes that should not show error toasts or trigger redirects
  private readonly PUBLIC_ROUTES = ['/assets/', '/home'];

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip interceptor for asset requests
    if (this.isPublicRoute(req.url)) {
      return next.handle(req);
    }

    // Get token from cookie (set by Company app)
    const token = this.authService.getAccessToken();

    // Clone request and add Authorization header if token exists
    if (token) {
      req = this.addAuthHeader(req, token);
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handle401Error(req, next);
        } else if (error.status === 403) {
          this.handleForbiddenError();
        } else if (error.status === 400) {
          this.handleBadRequestError(error);
        } else if (error.status === 404) {
          this.handleNotFoundError();
        } else if (error.status === 500) {
          this.handleServerError();
        }

        return throwError(() => error);
      })
    );
  }

  /**
   * Add Authorization header to request
   */
  private addAuthHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  /**
   * Handle 401 Unauthorized error
   * Attempts to refresh token, or redirects to Company app login
   */
  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.authService.getRefreshToken();

      if (refreshToken) {
        return this.authService.refreshAccessToken(refreshToken).pipe(
          switchMap(response => {
            this.isRefreshing = false;
            this.authService.setAccessToken(response.accessToken);
            this.refreshTokenSubject.next(response.accessToken);

            // Retry original request with new token
            return next.handle(this.addAuthHeader(req, response.accessToken));
          }),
          catchError(err => {
            this.isRefreshing = false;
            this.authService.clearAuthData();

            // Redirect to Company app login
            this.toastService.error('Your session has expired. Please log in again.');
            this.authService.redirectToLogin();

            return throwError(() => err);
          })
        );
      } else {
        this.isRefreshing = false;
        this.authService.clearAuthData();

        // Redirect to Company app login
        this.authService.redirectToLogin();

        return throwError(() => new Error('No refresh token available'));
      }
    } else {
      // If refresh is already in progress, queue the request
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => {
          return next.handle(this.addAuthHeader(req, token!));
        })
      );
    }
  }

  /**
   * Handle 403 Forbidden error
   */
  private handleForbiddenError(): void {
    this.toastService.error('Access denied. You do not have permission to access this resource.');
  }

  /**
   * Handle 400 Bad Request error
   */
  private handleBadRequestError(error: HttpErrorResponse): void {
    if (error.error?.message) {
      this.toastService.error(error.error.message);
    }
  }

  /**
   * Handle 404 Not Found error
   */
  private handleNotFoundError(): void {
    this.toastService.error('The requested resource was not found.');
  }

  /**
   * Handle 500 Internal Server Error
   */
  private handleServerError(): void {
    this.toastService.error('A server error occurred. Please try again later.');
  }

  /**
   * Check if route is public
   */
  private isPublicRoute(url: string): boolean {
    return this.PUBLIC_ROUTES.some(route => url.includes(route));
  }
}
