import { RewardType } from '@core/models/domain.models';
import { IconName } from '@shared/components/icon/icon.component';

export interface SystemRulesState {
  isCashAccepted: boolean;
  associationWindowHours: number;
  pointsPerItem: number;
  pointsPerDollar: number;
  requireApproval: boolean;
  emailForReceipt: boolean;
  emailForLogin: boolean;
  emailForCampaigns: boolean;
}

export interface LoyaltyTierState {
  tier: number;
  label: string;
  icon: IconName;
  minDonations: number;
  pointsMultiplier: number;
  color: string;
  bgColor: string;
  perks: string[];
  rank: number;
}

export interface RewardDefinitionState {
  id: number;
  referenceNumber: string;
  name: string;
  description: string;
  pointsRequired: number;
  rewardType: RewardType;
  rewardTypeLabel: string;
  value: number;
  isActive: boolean;
  isGiftable: boolean;
  maxRedemptionsPerUser: number | null;
  totalRedemptionLimit: number | null;
  totalRedemptions: number;
}

export interface RewardTransactionState {
  id: number;
  donorName: string;
  rewardName: string;
  rewardType: RewardType;
  rewardTypeLabel: string;
  rewardValue: number;
  pointsUsed: number;
  status: number;
  statusLabel: string;
  statusBadgeClass: string;
  voucherCode: string | null;
  createdAt: Date;
  isPending: boolean;
  isApproved: boolean;
}

export interface RewardFormState {
  name: string;
  description: string;
  pointsRequired: number;
  rewardType: RewardType;
  value: number;
  isActive: boolean;
  isGiftable: boolean;
  maxRedemptionsPerUser: number | null;
  totalRedemptionLimit: number | null;
}

export interface RewardTypeOption {
  value: RewardType;
  label: string;
}
