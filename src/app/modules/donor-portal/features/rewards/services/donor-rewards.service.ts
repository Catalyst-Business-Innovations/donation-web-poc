import { Injectable, inject, computed } from '@angular/core';
import { MockDataService } from '@core/services/mock-data.service';
import { CurrentUserService } from '@core/services/current-user.service';
import {
  PointsHeroState,
  TierProgressState,
  RewardCatalogueItemState,
  RewardTransactionState,
  DonorSearchResultState
} from '../models/rewards.state';
import {
  mapRewardToCatalogueItem,
  mapTransactionToState,
  mapTiersToProgress,
  mapDonorToSearchResult
} from '../models/rewards.mapper';

@Injectable({ providedIn: 'root' })
export class DonorRewardsService {
  private readonly mockData = inject(MockDataService);
  private readonly currentUser = inject(CurrentUserService);

  readonly catalogue = computed<RewardCatalogueItemState[]>(() => {
    const donor = this.currentUser.donor();
    return this.mockData
      .getAvailableRewardsForDonor(donor.id)
      .map(r => mapRewardToCatalogueItem(r, donor.loyaltyPoints));
  });

  readonly txnHistory = computed<RewardTransactionState[]>(() => {
    const donor = this.currentUser.donor();
    return this.mockData.getRewardTransactionsForDonor(donor.id).map(mapTransactionToState);
  });

  getHeroState(): PointsHeroState {
    const donor = this.currentUser.donor();
    const tier = this.mockData.getTier(donor.loyaltyTier);
    const catalogue = this.catalogue();
    return {
      availablePoints: donor.loyaltyPoints,
      multiplier: tier.pointsMultiplier,
      tierLabel: tier.label,
      catalogueCount: catalogue.length,
      giftableCount: catalogue.filter(r => r.isGiftable).length,
      redemptionCount: this.txnHistory().length
    };
  }

  getTierProgress(): TierProgressState {
    const donor = this.currentUser.donor();
    return mapTiersToProgress(this.mockData.loyaltyTiers, donor.loyaltyTier, donor.totalDonations);
  }

  getDonorPoints(): number {
    return this.currentUser.donor().loyaltyPoints;
  }

  searchDonors(query: string): DonorSearchResultState[] {
    const donor = this.currentUser.donor();
    const q = query.toLowerCase().trim();
    if (q.length < 2) return [];
    return this.mockData.donors
      .filter(
        d => d.id !== donor.id && (`${d.firstName} ${d.lastName}`.toLowerCase().includes(q) || d.phone.includes(q))
      )
      .slice(0, 6)
      .map(mapDonorToSearchResult);
  }

  redeemReward(rewardId: number): { success: boolean; pointsUsed: number; name: string } {
    const donor = this.currentUser.donor();
    const def = this.mockData.getAvailableRewardsForDonor(donor.id).find(r => r.id === rewardId);
    if (!def) return { success: false, pointsUsed: 0, name: '' };
    const txn = this.mockData.redeemReward(donor.id, def.id);
    return txn
      ? { success: true, pointsUsed: txn.pointsUsed, name: def.name }
      : { success: false, pointsUsed: 0, name: def.name };
  }

  giftReward(recipientId: number, rewardId: number): { success: boolean; recipientName: string; rewardName: string } {
    const donor = this.currentUser.donor();
    const def = this.mockData.getAvailableRewardsForDonor(donor.id).find(r => r.id === rewardId);
    const recipient = this.mockData.donors.find(d => d.id === recipientId);
    if (!def || !recipient) return { success: false, recipientName: '', rewardName: '' };
    const txn = this.mockData.giftReward(donor.id, recipientId, def.id);
    return txn
      ? { success: true, recipientName: `${recipient.firstName} ${recipient.lastName}`, rewardName: def.name }
      : { success: false, recipientName: '', rewardName: '' };
  }
}
