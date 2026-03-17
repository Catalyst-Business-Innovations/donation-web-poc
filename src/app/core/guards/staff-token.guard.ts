import { inject } from '@angular/core';
import { CanActivateFn, RouterStateSnapshot, ActivatedRouteSnapshot, Router } from '@angular/router';

/**
 * Guard for Staff Portal routes.
 * Simulated: checks sessionStorage flag set by StaffLoginComponent.
 * TODO: replace with real JWT/cookie check when company SSO is wired up.
 */
export const staffTokenGuard: CanActivateFn = (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const isAuthenticated = sessionStorage.getItem('staff_authenticated') === 'true';

  if (isAuthenticated) {
    return true;
  }

  sessionStorage.setItem('staff_return_url', state.url);
  return router.createUrlTree(['/staff/login']);
};
