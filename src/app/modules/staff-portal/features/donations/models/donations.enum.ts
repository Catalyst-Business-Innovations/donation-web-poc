import { DonationStatus, DonationMethod } from '@core/models/domain.models';

export type DonationTab = 'scheduled-donations' | 'completions';

export const StatusBadgeClass: Record<DonationStatus, string> = {
  [DonationStatus.Scheduled]: 'badge-info',
  [DonationStatus.CheckedIn]: 'badge-warning',
  [DonationStatus.Completed]: 'badge-success',
  [DonationStatus.Cancelled]: 'badge-danger',
  [DonationStatus.NoShow]: 'badge-gray'
};

export const MethodBadgeClass: Record<DonationMethod, string> = {
  [DonationMethod.Scheduled]: 'badge-purple',
  [DonationMethod.WalkIn]: 'badge-gray',
  [DonationMethod.Pickup]: 'badge-warning'
};
