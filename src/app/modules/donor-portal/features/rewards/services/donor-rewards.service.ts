import { Injectable, inject, computed } from '@angular/core';
import { MockDataService } from '@core/services/mock-data.service';
import {
  PointsHeroState,
  TierProgressState,
  RewardCatalogueItemState,
  RewardTransactionState,
  DonorSearchResultState,
} from '../models/rewards.state';
import {
  mapRewardToCatalogueItem,
  mapTransactionToState,
  mapTiersToProgress,
  mapDonorToSearchResult,
} from '../models/rewards.mapper';

@Injectable({ providedIn: 'root' })
export class DonorRewardsService {
  private readonly mockData = inject(MockDataService);
  private readonly donor = this.mockData.donors[0];

  readonly catalogue = computed<RewardCatalogueItemState[]>(() =>
    this.mockData.getAvailableRewardsForDonor(this.donor.id)
      .map(r => mapRewardToCatalogueItem(r, this.donor.loyaltyPoints))
  );

  readonly txnHistory = computed<RewardTransactionState[]>(() =>
    this.mockData.getRewardTransactionsForDonor(this.donor.id)
      .map(mapTransactionToState)
  );

  getHeroState(): PointsHeroState {
    const tier = this.mockData.getTier(this.donor.loyaltyTier);
    const catalogue = this.catalogue();
    return {
      availablePoints: this.donor.loyaltyPoints,
      multiplier: tier.pointsMultiplier,
      tierLabel: tier.label,
      catalogueCount: catalogue.length,
      giftableCount: catalogue.filter(r => r.isGiftable).length,
      redemptionCount: this.txnHistory().length,
    };
  }

  getTierProgress(): TierProgressState {
    return mapTiersToProgress(this.mockData.loyaltyTiers, this.donor.loyaltyTier, this.donor.totalDonations);
  }

  getDonorPoints(): number {
    return this.donor.loyaltyPoints;
  }

  searchDonors(query: string): DonorSearchResultState[] {
    const q = query.toLowerCase().trim();
    if (q.length < 2) return [];
    return this.mockData.donors
      .filter(d => d.id !== this.donor.id &&
        (`${d.firstName} ${d.lastName}`.toLowerCase().includes(q) || d.phone.includes(q)))
      .slice(0, 6)
      .map(mapDonorToSearchResult);
  }

  redeemReward(rewardId: number): { success: boolean; pointsUsed: number; name: string } {
    const def = this.mockData.getAvailableRewardsForDonor(this.donor.id).find(r => r.id === rewardId);
    if (!def) return { success: false, pointsUsed: 0, name: '' };
    const txn = this.mockData.redeemReward(this.donor.id, def.id);
    return txn
      ? { success: true, pointsUsed: txn.pointsUsed, name: def.name }
      : { success: false, pointsUsed: 0, name: def.name };
  }

  giftReward(recipientId: number, rewardId: number): { success: boolean; recipientName: string; rewardName: string } {
    const def = this.mockData.getAvailableRewardsForDonor(this.donor.id).find(r => r.id === rewardId);
    const recipient = this.mockData.donors.find(d => d.id === recipientId);
    if (!def || !recipient) return { success: false, recipientName: '', rewardName: '' };
    const txn = this.mockData.giftReward(this.donor.id, recipientId, def.id);
    return txn
      ? { success: true, recipientName: `${recipient.firstName} ${recipient.lastName}`, rewardName: def.name }
      : { success: false, recipientName: '', rewardName: '' };
  }
}
