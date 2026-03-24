import { inject } from '@angular/core';
import { CanActivateFn, RouterStateSnapshot, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard for Staff Portal routes.
 * Uses AuthService JWT validation to check authentication.
 * Redirects to Company app login if not authenticated.
 */
export const staffTokenGuard: CanActivateFn = (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.isAuthenticated()) {
    return true;
  }

  sessionStorage.setItem('staff_return_url', state.url);
  authService.redirectToLogin();
  return false;
};
