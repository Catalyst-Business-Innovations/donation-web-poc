import { RewardTypeLabel, RedemptionStatusLabel, RedemptionStatus } from '@core/models/domain.models';
import { RedemptionStatusBadgeClass } from './settings.enum';
import {
  SystemRulesState,
  LoyaltyTierState,
  RewardDefinitionState,
  RewardTransactionState,
  RewardFormState
} from './settings.state';
import {
  AppConfigResponse,
  LoyaltyTierResponse,
  RewardDefinitionResponse,
  RewardTransactionResponse
} from './settings.response';
import { UpdateAppConfigRequest, CreateRewardRequest, UpdateRewardRequest } from './settings.request';

export function mapAppConfigToState(cfg: AppConfigResponse): SystemRulesState {
  return {
    isCashAccepted: cfg.isCashAccepted,
    associationWindowHours: cfg.associationWindowHours,
    pointsPerItem: cfg.pointsPerItem,
    pointsPerDollar: cfg.pointsPerDollar,
    requireApproval: cfg.requireApproval,
    emailForReceipt: cfg.emailReqs.forReceipt,
    emailForLogin: cfg.emailReqs.forLogin,
    emailForCampaigns: cfg.emailReqs.forCampaigns
  };
}

export function mapSystemRulesToRequest(state: SystemRulesState): UpdateAppConfigRequest {
  return {
    isCashAccepted: state.isCashAccepted,
    associationWindowHours: state.associationWindowHours,
    pointsPerItem: state.pointsPerItem,
    pointsPerDollar: state.pointsPerDollar,
    requireApproval: state.requireApproval,
    emailReqs: {
      forReceipt: state.emailForReceipt,
      forLogin: state.emailForLogin,
      forCampaigns: state.emailForCampaigns
    }
  };
}

export function mapLoyaltyTierToState(tier: LoyaltyTierResponse, index: number): LoyaltyTierState {
  return {
    tier: tier.tier,
    label: tier.label,
    icon: tier.icon,
    minDonations: tier.minDonations,
    pointsMultiplier: tier.pointsMultiplier,
    color: tier.color,
    bgColor: tier.bgColor,
    perks: [...tier.perks],
    rank: index + 1
  };
}

export function mapRewardDefinitionToState(r: RewardDefinitionResponse): RewardDefinitionState {
  return {
    id: r.id,
    referenceNumber: r.referenceNumber,
    name: r.name,
    description: r.description,
    pointsRequired: r.pointsRequired,
    rewardType: r.rewardType,
    rewardTypeLabel: RewardTypeLabel[r.rewardType],
    value: r.value,
    isActive: r.isActive,
    isGiftable: r.isGiftable ?? false,
    maxRedemptionsPerUser: r.maxRedemptionsPerUser ?? null,
    totalRedemptionLimit: r.totalRedemptionLimit ?? null,
    totalRedemptions: r.totalRedemptions
  };
}

export function mapRewardTransactionToState(txn: RewardTransactionResponse): RewardTransactionState {
  return {
    id: txn.id,
    donorName: txn.donorName,
    rewardName: txn.rewardName,
    rewardType: txn.rewardType,
    rewardTypeLabel: RewardTypeLabel[txn.rewardType],
    rewardValue: txn.rewardValue,
    pointsUsed: txn.pointsUsed,
    status: txn.status,
    statusLabel: RedemptionStatusLabel[txn.status],
    statusBadgeClass: RedemptionStatusBadgeClass[txn.status] ?? 'badge-gray',
    voucherCode: txn.voucherCode ?? null,
    createdAt: txn.createdAt,
    isPending: txn.status === RedemptionStatus.Pending,
    isApproved: txn.status === RedemptionStatus.Approved
  };
}

export function mapRewardFormToCreateRequest(form: RewardFormState): CreateRewardRequest {
  return {
    name: form.name.trim(),
    description: form.description,
    pointsRequired: form.pointsRequired,
    rewardType: form.rewardType,
    value: form.value,
    isActive: form.isActive,
    isGiftable: form.isGiftable,
    maxRedemptionsPerUser: form.maxRedemptionsPerUser ?? undefined,
    totalRedemptionLimit: form.totalRedemptionLimit ?? undefined
  };
}

export function mapRewardFormToUpdateRequest(form: RewardFormState): UpdateRewardRequest {
  return {
    name: form.name.trim(),
    description: form.description,
    pointsRequired: form.pointsRequired,
    rewardType: form.rewardType,
    value: form.value,
    isActive: form.isActive,
    isGiftable: form.isGiftable,
    maxRedemptionsPerUser: form.maxRedemptionsPerUser ?? undefined,
    totalRedemptionLimit: form.totalRedemptionLimit ?? undefined
  };
}

export function mapRewardToFormState(r: RewardDefinitionState): RewardFormState {
  return {
    name: r.name,
    description: r.description,
    pointsRequired: r.pointsRequired,
    rewardType: r.rewardType,
    value: r.value,
    isActive: r.isActive,
    isGiftable: r.isGiftable,
    maxRedemptionsPerUser: r.maxRedemptionsPerUser,
    totalRedemptionLimit: r.totalRedemptionLimit
  };
}

export function emptyRewardForm(): RewardFormState {
  return {
    name: '',
    description: '',
    pointsRequired: 100,
    rewardType: 1,
    value: 5,
    isActive: true,
    isGiftable: false,
    maxRedemptionsPerUser: null,
    totalRedemptionLimit: null
  };
}
