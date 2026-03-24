import {
  Donor,
  DonorTier,
  LoyaltyTierConfig,
  RewardDefinition,
  RewardTransaction,
  RedemptionStatus,
  RedemptionStatusLabel,
  RewardTypeLabel
} from '@core/models/domain.models';
import {
  RewardCatalogueItemState,
  RewardTransactionState,
  TierStopState,
  TierProgressState,
  DonorSearchResultState
} from './rewards.state';
import { RedemptionStatusBadgeClass } from './rewards.enum';

export const mapRewardToCatalogueItem = (r: RewardDefinition, donorPoints: number): RewardCatalogueItemState => ({
  id: r.id,
  name: r.name,
  description: r.description,
  rewardTypeLabel: RewardTypeLabel[r.rewardType],
  value: r.value,
  pointsRequired: r.pointsRequired,
  isGiftable: !!r.isGiftable,
  canRedeem: donorPoints >= r.pointsRequired,
  canGift: !!r.isGiftable && donorPoints >= r.pointsRequired
});

export const mapTransactionToState = (txn: RewardTransaction): RewardTransactionState => ({
  id: txn.id,
  rewardName: txn.rewardName,
  createdAt: txn.createdAt,
  pointsUsed: txn.pointsUsed,
  statusLabel: RedemptionStatusLabel[txn.status] ?? String(txn.status),
  statusBadgeClass: RedemptionStatusBadgeClass[txn.status] ?? 'badge-gray',
  isGift: !!txn.isGift,
  giftedToName: txn.giftedToName,
  giftedFromName: txn.giftedFromName,
  voucherCode: txn.voucherCode
});

export const mapTierToStop = (t: LoyaltyTierConfig, donorTier: DonorTier, isLast: boolean): TierStopState => ({
  tier: t.tier,
  icon: t.icon,
  label: t.label,
  minDonations: t.minDonations,
  isCurrent: t.tier === donorTier,
  isAchieved: t.tier <= donorTier,
  isLast
});

export const mapTiersToProgress = (
  tiers: LoyaltyTierConfig[],
  donorTier: DonorTier,
  totalDonations: number
): TierProgressState => {
  const stops = tiers.map((t, i) => mapTierToStop(t, donorTier, i === tiers.length - 1));
  const idx = tiers.findIndex(t => t.tier === donorTier);
  const nextTier = idx < tiers.length - 1 ? tiers[idx + 1] : null;
  return {
    stops,
    nextTierLabel: nextTier?.label ?? null,
    nextTierIcon: nextTier?.icon ?? null,
    donationsToNext: nextTier ? nextTier.minDonations - totalDonations : 0,
    totalDonations
  };
};

export const mapDonorToSearchResult = (d: Donor): DonorSearchResultState => ({
  id: d.id,
  firstName: d.firstName,
  lastName: d.lastName,
  initials: `${d.firstName?.[0] ?? ''}${d.lastName?.[0] ?? ''}`,
  phone: d.phone
});
