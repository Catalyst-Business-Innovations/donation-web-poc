import { inject } from '@angular/core';
import { CanActivateFn, Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { STORAGE_KEYS } from '../constants/storage-keys';

/**
 * Guard for Donor Portal routes.
 * Requires a valid JWT with role = 'donor'.
 * Staff users are redirected to the staff portal with a warning.
 */
export const donorAuthGuard: CanActivateFn = (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const toast = inject(ToastService);

  if (!authService.isAuthenticated()) {
    sessionStorage.setItem(STORAGE_KEYS.DONOR_RETURN_URL, state.url);
    router.navigate(['/donor/login']);
    return false;
  }

  const userInfo = authService.getUserInfo();
  if (userInfo?.role !== 'donor') {
    toast.error('Access Denied', 'You do not have permission to access the Donor Portal.');
    router.navigate(['/staff/new-donation']);
    return false;
  }

  return true;
};
