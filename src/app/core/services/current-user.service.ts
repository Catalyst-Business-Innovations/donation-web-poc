import { Injectable, inject, signal, computed } from '@angular/core';
import { MockDataService } from './mock-data.service';
import { AuthService } from './auth.service';
import { Donor, StaffSession } from '../models/domain.models';

export type PortalContext = 'staff' | 'donor';

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  private readonly mockData = inject(MockDataService);
  private readonly authService = inject(AuthService);

  /**
   * Active portal context — set by the portal shell component on init.
   */
  private readonly _portal = signal<PortalContext>('staff');
  readonly portal = this._portal.asReadonly();

  /**
   * Donor identity — in production, resolved from JWT `userid` claim.
   * For now, defaults to the first mock donor.
   */
  private readonly _donorId = signal<number>(this.mockData.donors[0]?.id ?? 0);
  readonly donorId = this._donorId.asReadonly();

  readonly donor = computed<Donor>(() => {
    const id = this._donorId();
    return this.mockData.donors.find(d => d.id === id) ?? this.mockData.donors[0];
  });

  /**
   * Staff session — in production, resolved from JWT claims.
   * For now, uses the mock staff session.
   */
  readonly staffSession = computed<StaffSession>(() => this.mockData.session);

  /**
   * Common user properties derived from JWT or mock data.
   */
  readonly userId = computed(() =>
    this._portal() === 'donor'
      ? String(this._donorId())
      : String(this.mockData.session.staffId)
  );

  readonly displayName = computed(() => {
    if (this._portal() === 'donor') {
      const d = this.donor();
      return `${d.firstName} ${d.lastName}`;
    }
    return this.mockData.session.staffName;
  });

  readonly initials = computed(() => {
    const name = this.displayName();
    const parts = name.split(' ').filter(Boolean);
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : (parts[0]?.[0] ?? '').toUpperCase();
  });

  readonly email = computed(() => {
    if (this._portal() === 'donor') {
      return this.donor().email;
    }
    return this.authService.getUserInfo()?.email ?? '';
  });

  setPortal(portal: PortalContext): void {
    this._portal.set(portal);
  }

  setDonorId(id: number): void {
    this._donorId.set(id);
  }
}
