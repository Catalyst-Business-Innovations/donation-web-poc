import { Donor, DonorTier } from '../../../../../core/models/domain.models';

export interface DonorLookupRequest {
  query: string;
  tierFilter: string;
}

export interface DonorLookupItem {
  id: number;
  firstName: string;
  lastName: string;
  initials: string;
  email: string;
  phone: string;
  loyaltyTier: DonorTier;
  loyaltyPoints: number;
  totalDonations: number;
  lifetimeValue: number;
  lastDonationDate?: Date;
}

export interface DonorLookupState {
  query: string;
  tierFilter: string;
  selectedId: number | null;
}

export class DonorLookupMapper {
  static toItem(d: Donor): DonorLookupItem {
    return {
      id: d.id,
      firstName: d.firstName,
      lastName: d.lastName,
      initials: `${d.firstName[0]}${d.lastName[0]}`.toUpperCase(),
      email: d.email,
      phone: d.phone,
      loyaltyTier: d.loyaltyTier,
      loyaltyPoints: d.loyaltyPoints,
      totalDonations: d.totalDonations,
      lifetimeValue: d.lifetimeValue,
      lastDonationDate: d.lastDonationDate
    };
  }

  static filter(donors: Donor[], q: string, tier: DonorTier | ''): DonorLookupItem[] {
    const lq = q.toLowerCase();
    return donors
      .filter(d => {
        const matchQ = !lq || `${d.firstName} ${d.lastName} ${d.phone} ${d.email}`.toLowerCase().includes(lq);
        return matchQ && (!tier || d.loyaltyTier === tier);
      })
      .map(DonorLookupMapper.toItem);
  }
}
