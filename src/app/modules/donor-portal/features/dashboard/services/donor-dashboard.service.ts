import { Injectable, inject, computed } from '@angular/core';
import { MockDataService } from '@core/services/mock-data.service';
import { CurrentUserService } from '@core/services/current-user.service';
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
  private readonly currentUser = inject(CurrentUserService);

  getDonorStats(): DonorStatsState {
    return mapDonorToStats(this.currentUser.donor());
  }

  getTierDisplay(): TierDisplayState {
    const donor = this.currentUser.donor();
    const tier = this.mockData.getTier(donor.loyaltyTier);
    return mapDonorToTierDisplay(donor, tier, this.mockData.loyaltyTiers);
  }

  getImpactItems(): ImpactItemState[] {
    return mapDonorToImpactItems(this.currentUser.donor());
  }

  getRecentDonations(): RecentDonationState[] {
    const donor = this.currentUser.donor();
    return this.mockData.getDonationsByDonor(donor.id).map(mapDonationToRecentDonation);
  }

  readonly activeCampaigns = computed(() =>
    this.mockData
      .campaigns()
      .filter(c => c.status === CampaignStatus.Active)
      .map(mapCampaignToSummary)
  );

  getBadges(): BadgeState[] {
    return mapDonorToBadges(this.currentUser.donor());
  }
}
