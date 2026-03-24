import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { CurrentUserService } from './current-user.service';
import { MockDataService } from './mock-data.service';
import { Donor } from '../models/domain.models';

/**
 * Development-only auth service that simulates JWT authentication.
 * Generates a mock JWT token with proper claims for both portals.
 * Replace with real Company SSO integration in production.
 */
@Injectable({ providedIn: 'root' })
export class DevAuthService {
  private readonly authService = inject(AuthService);
  private readonly currentUser = inject(CurrentUserService);
  private readonly mockData = inject(MockDataService);

  /**
   * Simulate staff login — clears any existing session,
   * creates a JWT with staff claims, and sets portal context.
   */
  loginAsStaff(username: string): void {
    // Clear any previous session (e.g., donor JWT)
    this.authService.clearAuthData();

    const session = this.mockData.session;
    const token = this.createMockJwt({
      userid: String(session.staffId),
      companyid: '1',
      email: `${username.toLowerCase()}@brijjworks.com`,
      fullname: session.staffName,
      role: 'staff',
      phonenumber: '(555) 100-0000',
    });

    this.authService.setTokens(token, `refresh-${Date.now()}`, `session-${Date.now()}`);
    this.currentUser.setPortal('staff');
  }

  /**
   * Simulate donor login — clears any existing session,
   * creates a JWT with donor claims, and wires up donor context.
   */
  loginAsDonor(email: string): void {
    // Clear any previous session (e.g., staff JWT)
    this.authService.clearAuthData();

    const donor = this.findDonorByEmail(email);
    const token = this.createMockJwt({
      userid: String(donor.id),
      companyid: '1',
      email: donor.email,
      fullname: `${donor.firstName} ${donor.lastName}`,
      role: 'donor',
      phonenumber: donor.phone,
    });

    this.authService.setTokens(token, `refresh-${Date.now()}`, `session-${Date.now()}`);
    this.currentUser.setPortal('donor');
    this.currentUser.setDonorId(donor.id);
  }

  /**
   * Clear simulated auth session.
   */
  logout(): void {
    this.authService.clearAuthData();
  }

  private findDonorByEmail(email: string): Donor {
    const match = this.mockData.donors.find(d => d.email.toLowerCase() === email.toLowerCase());
    return match ?? this.mockData.donors[0];
  }

  /**
   * Create a mock JWT token with standard claims.
   * Uses base64url encoding to create a valid JWT structure that jwt-decode can parse.
   * Token expires in 24 hours.
   */
  private createMockJwt(claims: {
    userid: string;
    companyid: string;
    email: string;
    fullname: string;
    role: string;
    phonenumber: string;
  }): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      ...claims,
      sub: claims.userid,
      iss: 'dev-auth-simulator',
      aud: 'donation-app',
      iat: now,
      nbf: now,
      exp: now + 86400, // 24 hours
    };

    const encode = (obj: object): string =>
      btoa(JSON.stringify(obj))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    return `${encode(header)}.${encode(payload)}.dev-signature`;
  }
}
