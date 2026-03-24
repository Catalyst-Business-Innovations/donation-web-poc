import { RewardType, RedemptionStatus } from '@core/models/domain.models';
import { IconName } from '@shared/components/icon/icon.component';

export interface AppConfigResponse {
  isCashAccepted: boolean;
  associationWindowHours: number;
  pointsPerItem: number;
  pointsPerDollar: number;
  requireApproval: boolean;
  emailReqs: {
    forReceipt: boolean;
    forLogin: boolean;
    forCampaigns: boolean;
  };
}

export interface LoyaltyTierResponse {
  tier: number;
  label: string;
  icon: IconName;
  minDonations: number;
  pointsMultiplier: number;
  color: string;
  bgColor: string;
  perks: string[];
}

export interface RewardDefinitionResponse {
  id: number;
  referenceNumber: string;
  name: string;
  description: string;
  pointsRequired: number;
  rewardType: RewardType;
  value: number;
  isActive: boolean;
  isGiftable?: boolean;
  maxRedemptionsPerUser?: number;
  totalRedemptionLimit?: number;
  totalRedemptions: number;
  createdAt: Date;
}

export interface RewardTransactionResponse {
  id: number;
  donorName: string;
  rewardName: string;
  rewardType: RewardType;
  rewardValue: number;
  pointsUsed: number;
  status: RedemptionStatus;
  voucherCode?: string;
  createdAt: Date;
}
