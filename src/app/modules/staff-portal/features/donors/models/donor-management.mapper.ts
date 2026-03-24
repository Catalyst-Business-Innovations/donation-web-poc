import { Donor, DonorTier, LoyaltyTierConfig } from '@core/models/domain.models';
import { DonorListItemState, DonorDetailState, DonorFormState } from './donor-management.state';
import { TierBadgeClass } from './donor-management.enum';

export function mapDonorToListItem(donor: Donor, tierConfig: LoyaltyTierConfig): DonorListItemState {
  return {
    id: donor.id,
    firstName: donor.firstName,
    lastName: donor.lastName,
    initials: `${donor.firstName?.[0] ?? ''}${donor.lastName?.[0] ?? ''}`.toUpperCase(),
    phone: donor.phone,
    email: donor.email,
    totalDonations: donor.totalDonations,
    lifetimeValue: donor.lifetimeValue,
    loyaltyTier: donor.loyaltyTier,
    tierLabel: tierConfig.label,
    tierIcon: tierConfig.icon,
    tierBadgeClass: tierBadgeClass(donor.loyaltyTier),
    loyaltyPoints: donor.loyaltyPoints,
    lastDonationDate: donor.lastDonationDate
  };
}

export function mapDonorToDetail(
  donor: Donor,
  tierConfig: LoyaltyTierConfig,
  recentDonations: { locationName: string; timestamp: Date }[]
): DonorDetailState {
  return {
    id: donor.id,
    firstName: donor.firstName,
    lastName: donor.lastName,
    initials: `${donor.firstName?.[0] ?? ''}${donor.lastName?.[0] ?? ''}`.toUpperCase(),
    email: donor.email,
    phone: donor.phone,
    totalDonations: donor.totalDonations,
    lifetimeValue: donor.lifetimeValue,
    loyaltyPoints: donor.loyaltyPoints,
    tierLabel: tierConfig.label,
    tierIcon: tierConfig.icon,
    recentDonations
  };
}

export function mapDonorToForm(donor: Donor): DonorFormState {
  return {
    firstName: donor.firstName,
    lastName: donor.lastName,
    email: donor.email,
    phone: donor.phone,
    address: donor.address ?? ''
  };
}

export function emptyDonorForm(): DonorFormState {
  return { firstName: '', lastName: '', email: '', phone: '', address: '' };
}

export function tierBadgeClass(tier: DonorTier): string {
  return TierBadgeClass[tier] ?? 'badge-gray';
}
