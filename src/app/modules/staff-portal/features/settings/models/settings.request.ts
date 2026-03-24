import { RewardType } from '@core/models/domain.models';

export interface UpdateAppConfigRequest {
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

export interface UpdateTierMultiplierRequest {
  tier: number;
  pointsMultiplier: number;
}

export interface CreateRewardRequest {
  name: string;
  description: string;
  pointsRequired: number;
  rewardType: RewardType;
  value: number;
  isActive: boolean;
  isGiftable: boolean;
  maxRedemptionsPerUser?: number;
  totalRedemptionLimit?: number;
}

export interface UpdateRewardRequest {
  name: string;
  description: string;
  pointsRequired: number;
  rewardType: RewardType;
  value: number;
  isActive: boolean;
  isGiftable: boolean;
  maxRedemptionsPerUser?: number;
  totalRedemptionLimit?: number;
}
