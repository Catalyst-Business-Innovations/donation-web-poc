import { Injectable, inject, signal, computed } from '@angular/core';
import { MockDataService } from './mock-data.service';
import { AuthService } from './auth.service';
import { Donor, StaffSession } from '../models/domain.models';

export type PortalContext = 'staff' | 'donor';

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  private readonly mockData = inject(MockDataService);
  private readonly authService = inject(AuthService);

  private readonly _portal = signal<PortalContext>(this.resolvePortalFromToken());
  readonly portal = this._portal.asReadonly();

  private readonly _donorId = signal<number>(this.resolveDonorIdFromToken());
  readonly donorId = this._donorId.asReadonly();

  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());

  readonly donor = computed<Donor>(() => {
    const id = this._donorId();
    return this.mockData.donors.find(d => d.id === id) ?? this.mockData.donors[0];
  });

  readonly staffSession = computed<StaffSession>(() => this.mockData.session);

  /**
   * Display name — portal-aware.
   * Staff portal: always shows staff session name.
   * Donor portal: always shows donor name.
   */
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

  /**
   * Email — portal-aware.
   * Staff portal: from JWT or empty.
   * Donor portal: from donor record.
   */
  readonly email = computed(() => {
    if (this._portal() === 'donor') {
      return this.donor().email;
    }
    return this.authService.getUserInfo()?.email ?? '';
  });

  readonly userId = computed(() =>
    this._portal() === 'donor' ? String(this._donorId()) : String(this.mockData.session.staffId)
  );

  readonly role = computed(() => this.authService.getUserInfo()?.role ?? '');

  /**
   * @internal Called by DevAuthService and portal shell components only.
   * Validates that the caller has a matching JWT role before allowing the switch.
   */
  setPortal(portal: PortalContext): void {
    const jwtRole = this.authService.getUserInfo()?.role;
    if (jwtRole && jwtRole !== portal) {
      console.warn(`setPortal('${portal}') rejected — JWT role is '${jwtRole}'`);
      return;
    }
    this._portal.set(portal);
  }

  /**
   * @internal Called by DevAuthService only.
   * Validates that the ID matches the JWT userid claim.
   */
  setDonorId(id: number): void {
    const jwtUserId = this.authService.getUserInfo()?.userid;
    if (jwtUserId && Number(jwtUserId) !== id) {
      console.warn(`setDonorId(${id}) rejected — JWT userid is '${jwtUserId}'`);
      return;
    }
    this._donorId.set(id);
  }

  /**
   * Resolve portal context from JWT role on service init / page refresh.
   */
  private resolvePortalFromToken(): PortalContext {
    const info = this.authService.getUserInfo();
    return info?.role === 'donor' ? 'donor' : 'staff';
  }

  /**
   * Resolve donor ID from JWT on service init / page refresh.
   */
  private resolveDonorIdFromToken(): number {
    const info = this.authService.getUserInfo();
    if (info?.role === 'donor' && info.userid) {
      const id = Number(info.userid);
      if (!isNaN(id) && this.mockData.donors.some(d => d.id === id)) {
        return id;
      }
    }
    return this.mockData.donors[0]?.id ?? 0;
  }
}
