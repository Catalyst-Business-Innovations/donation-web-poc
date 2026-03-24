import { inject } from '@angular/core';
import { CanActivateFn, RouterStateSnapshot, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { STORAGE_KEYS } from '../constants/storage-keys';

/**
 * Guard for Staff Portal routes.
 * Requires a valid JWT with role = 'staff'.
 * Donors are redirected to the donor portal with a warning.
 */
export const staffAuthGuard: CanActivateFn = (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const toast = inject(ToastService);

  if (!authService.isAuthenticated()) {
    sessionStorage.setItem(STORAGE_KEYS.STAFF_RETURN_URL, state.url);
    router.navigate(['/staff/login']);
    return false;
  }

  const userInfo = authService.getUserInfo();
  if (userInfo?.role !== 'staff') {
    toast.error('Access Denied', 'You do not have permission to access the Staff Portal.');
    router.navigate(['/donor/dashboard']);
    return false;
  }

  return true;
};
