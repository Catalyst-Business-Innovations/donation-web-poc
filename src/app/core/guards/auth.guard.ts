import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth Guard to protect routes that require authentication
 * Redirects to Company app login if not authenticated
 * Usage: Add to route configuration: canActivate: [authGuard]
 */
export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);

  // Public routes that don't require authentication
  const publicRoutes = ['/home'];

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(publicRoute => state.url.startsWith(publicRoute));

  if (isPublicRoute) {
    return true;
  }

  // Check if user is authenticated (has valid token from Company app)
  if (!authService.isAuthenticated()) {
    // Store the attempted URL for redirecting after login
    sessionStorage.setItem('redirectUrl', state.url);
    // Redirect to Company app login
    authService.redirectToLogin();
    return false;
  }

  // Check for route-specific permissions if defined
  const requiredPermission = route.data['permission'];
  if (requiredPermission) {
    // You can implement permission checking logic here
    // For now, we'll allow all authenticated users
    return true;
  }

  return true;
};

/**
 * Role Guard to protect routes based on user roles
 * Redirects to Company app login if not authenticated, or shows error if wrong role
 * Usage: Add to route configuration: canActivate: [roleGuard], data: { roles: ['admin', 'staff'] }
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);

  // Check if user is authenticated first
  if (!authService.isAuthenticated()) {
    sessionStorage.setItem('redirectUrl', state.url);
    authService.redirectToLogin();
    return false;
  }

  // Get user info
  const userInfo = authService.getUserInfo();
  if (!userInfo) {
    authService.redirectToLogin();
    return false;
  }

  // Check if route has role requirements
  const requiredRoles = route.data['roles'] as string[];
  if (requiredRoles && requiredRoles.length > 0) {
    const userRole = userInfo.role?.toLowerCase();
    const hasRole = requiredRoles.some(role => role.toLowerCase() === userRole);

    if (!hasRole) {
      // User doesn't have required role - show error
      alert('Access denied. You do not have the required role to access this page.');
      window.history.back();
      return false;
    }
  }

  return true;
};
