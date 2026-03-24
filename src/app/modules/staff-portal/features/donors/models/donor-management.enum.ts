import { DonorTier } from '@core/models/domain.models';

export type ModalMode = 'view' | 'add' | 'edit' | null;

export const TierBadgeClass: Record<DonorTier, string> = {
  [DonorTier.Gold]: 'badge-warning',
  [DonorTier.Silver]: 'badge-gray',
  [DonorTier.Bronze]: 'badge-danger',
  [DonorTier.Platinum]: 'badge-purple'
};
