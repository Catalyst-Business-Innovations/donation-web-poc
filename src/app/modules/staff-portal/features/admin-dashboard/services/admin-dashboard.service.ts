import { Injectable, inject } from '@angular/core';
import { MockDataService } from '@core/services/mock-data.service';
import { LocationStatusLabel } from '@core/models/domain.models';
import {
  MetricCardState,
  TrendItemState,
  DonutSegmentState,
  CategoryBreakdownState,
  StoreStatusState,
  RecentDonationState
} from '../models/admin-dashboard.state';
import {
  mapAnalyticsToMetrics,
  mapTrendPoints,
  mapDonutSegments,
  mapCategoryBreakdown,
  mapLocationToStoreStatus,
  mapDonationToRecentRow
} from '../models/admin-dashboard.mapper';

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  private readonly mockData = inject(MockDataService);

  getMetrics(): MetricCardState[] {
    const a = this.mockData.analytics;
    return mapAnalyticsToMetrics({
      totalDonations: a.totalDonations,
      activeDonors: a.activeDonors,
      avgProcessTimeMin: a.avgProcessTimeMin
    });
  }

  getTrends(): TrendItemState[] {
    return mapTrendPoints(this.mockData.analytics.trends);
  }

  getDonutSegments(): DonutSegmentState[] {
    return mapDonutSegments(this.mockData.analytics.categoryBreakdown);
  }

  getCategoryBreakdown(): CategoryBreakdownState[] {
    return mapCategoryBreakdown(this.mockData.analytics.categoryBreakdown);
  }

  getStoreStatuses(): StoreStatusState[] {
    return this.mockData.locations.map(loc =>
      mapLocationToStoreStatus({
        id: loc.id,
        name: loc.name,
        address: loc.address,
        status: LocationStatusLabel[loc.status].toLowerCase(),
        donationsToday: loc.donationsToday,
        itemsToday: loc.itemsToday,
        staffCount: loc.staffCount
      })
    );
  }

  getRecentDonations(): RecentDonationState[] {
    return this.mockData.donations.map(d =>
      mapDonationToRecentRow({
        id: d.id,
        receiptNumber: d.receiptNumber,
        donorName: d.donorName ?? null,
        locationName: d.locationName,
        timestamp: d.timestamp,
        totalItems: d.totalItems,
        status: d.status
      })
    );
  }

  getTotalDonations(): number {
    return this.mockData.analytics.totalDonations;
  }
}
