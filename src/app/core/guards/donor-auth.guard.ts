import { inject } from '@angular/core';
import { CanActivateFn, Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';

/**
 * Guard for Donor Portal routes.
 * Checks sessionStorage for donor_authenticated flag.
 * Redirects to /donor/login if not authenticated, preserving the intended URL.
 */
export const donorAuthGuard: CanActivateFn = (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const isAuthenticated = sessionStorage.getItem('donor_authenticated') === 'true';

  if (isAuthenticated) {
    return true;
  }

  sessionStorage.setItem('donor_return_url', state.url);
  return router.createUrlTree(['/donor/login']);
};
