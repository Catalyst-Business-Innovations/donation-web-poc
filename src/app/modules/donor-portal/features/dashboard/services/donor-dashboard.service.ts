import { Injectable, inject, computed } from '@angular/core';
import { MockDataService } from '@core/services/mock-data.service';
import { CampaignStatus } from '@core/models/domain.models';
import {
  DonorStatsState,
  TierDisplayState,
  ImpactItemState,
  RecentDonationState,
  CampaignSummaryState,
  BadgeState
} from '../models/dashboard.state';
import {
  mapDonorToStats,
  mapDonorToTierDisplay,
  mapDonorToImpactItems,
  mapDonationToRecentDonation,
  mapCampaignToSummary,
  mapDonorToBadges
} from '../models/dashboard.mapper';

@Injectable({ providedIn: 'root' })
export class DonorDashboardService {
  private readonly mockData = inject(MockDataService);

  getDonorStats(): DonorStatsState {
    return mapDonorToStats(this.mockData.donors[0]);
  }

  getTierDisplay(): TierDisplayState {
    const donor = this.mockData.donors[0];
    const tier = this.mockData.getTier(donor.loyaltyTier);
    return mapDonorToTierDisplay(donor, tier, this.mockData.loyaltyTiers);
  }

  getImpactItems(): ImpactItemState[] {
    return mapDonorToImpactItems(this.mockData.donors[0]);
  }

  getRecentDonations(): RecentDonationState[] {
    const donor = this.mockData.donors[0];
    return this.mockData.getDonationsByDonor(donor.id).map(mapDonationToRecentDonation);
  }

  readonly activeCampaigns = computed(() =>
    this.mockData
      .campaigns()
      .filter(c => c.status === CampaignStatus.Active)
      .map(mapCampaignToSummary)
  );

  getBadges(): BadgeState[] {
    return mapDonorToBadges(this.mockData.donors[0]);
  }
}
