import { DonorTier } from '@core/models/domain.models';
import { IconName } from '@shared/components/icon/icon.component';

export interface DonorListItemState {
  id: number;
  firstName: string;
  lastName: string;
  initials: string;
  phone: string;
  email: string;
  totalDonations: number;
  lifetimeValue: number;
  loyaltyTier: DonorTier;
  tierLabel: string;
  tierIcon: IconName;
  tierBadgeClass: string;
  loyaltyPoints: number;
  lastDonationDate?: Date;
}

export interface DonorDetailState {
  id: number;
  firstName: string;
  lastName: string;
  initials: string;
  email: string;
  phone: string;
  totalDonations: number;
  lifetimeValue: number;
  loyaltyPoints: number;
  tierLabel: string;
  tierIcon: IconName;
  recentDonations: { locationName: string; timestamp: Date }[];
}

export interface DonorFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}
