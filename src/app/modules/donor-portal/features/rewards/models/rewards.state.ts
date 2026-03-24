import { IconName } from '@shared/components/icon/icon.component';
import { LoyaltyTierConfig, RewardDefinition, RedemptionStatus } from '@core/models/domain.models';

export interface PointsHeroState {
  availablePoints: number;
  multiplier: number;
  tierLabel: string;
  catalogueCount: number;
  giftableCount: number;
  redemptionCount: number;
}

export interface TierStopState {
  tier: import('@core/models/domain.models').DonorTier;
  icon: IconName;
  label: string;
  minDonations: number;
  isCurrent: boolean;
  isAchieved: boolean;
  isLast: boolean;
}

export interface TierProgressState {
  stops: TierStopState[];
  nextTierLabel: string | null;
  nextTierIcon: IconName | null;
  donationsToNext: number;
  totalDonations: number;
}

export interface RewardCatalogueItemState {
  id: number;
  name: string;
  description: string;
  rewardTypeLabel: string;
  value: number;
  pointsRequired: number;
  isGiftable: boolean;
  canRedeem: boolean;
  canGift: boolean;
}

export interface RewardTransactionState {
  id: number;
  rewardName: string;
  createdAt: Date;
  pointsUsed: number;
  statusLabel: string;
  statusBadgeClass: string;
  isGift: boolean;
  giftedToName?: string;
  giftedFromName?: string;
  voucherCode?: string;
}

export interface DonorSearchResultState {
  id: number;
  firstName: string;
  lastName: string;
  initials: string;
  phone: string;
}
