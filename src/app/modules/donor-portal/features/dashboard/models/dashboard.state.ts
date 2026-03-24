import { IconName } from '@shared/components/icon/icon.component';
import { LoyaltyTierConfig } from '@core/models/domain.models';

export interface DonorStatsState {
  firstName: string;
  lastName: string;
  joinDate: Date;
  totalDonations: number;
  loyaltyPoints: number;
  lifetimeValue: number;
}

export interface TierDisplayState {
  tier: LoyaltyTierConfig;
  nextTier: LoyaltyTierConfig | null;
  progress: number;
  donationsToNext: number;
}

export interface ImpactItemState {
  icon: IconName;
  value: string;
  label: string;
}

export interface RecentDonationState {
  id: number;
  locationName: string;
  timestamp: Date;
  totalItems: number;
  loyaltyPointsEarned: number;
}

export interface CampaignSummaryState {
  id: number;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
}

export interface BadgeState {
  icon: IconName;
  label: string;
  earned: boolean;
}
