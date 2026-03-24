import { inject } from '@angular/core';
import { CanActivateFn, Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard for Donor Portal routes.
 * Uses AuthService JWT validation to check authentication.
 * Redirects to Company app login if not authenticated, preserving the intended URL.
 */
export const donorAuthGuard: CanActivateFn = (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.isAuthenticated()) {
    return true;
  }

  sessionStorage.setItem('donor_return_url', state.url);
  authService.redirectToLogin();
  return false;
};
