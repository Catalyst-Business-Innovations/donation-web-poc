import { DonationStatus, DonationStatusLabel } from '@core/models/domain.models';
import {
  MetricCardState,
  TrendItemState,
  DonutSegmentState,
  CategoryBreakdownState,
  StoreStatusState,
  RecentDonationState
} from './admin-dashboard.state';
import {
  AnalyticsMetricsResponse,
  TrendPointResponse,
  CategoryBreakdownResponse,
  LocationStatusResponse,
  RecentDonationResponse
} from './admin-dashboard.response';

export function mapAnalyticsToMetrics(analytics: AnalyticsMetricsResponse): MetricCardState[] {
  return [
    { value: analytics.totalDonations.toLocaleString(), label: 'Total Donations' },
    { value: analytics.activeDonors.toLocaleString(), label: 'Active Donors' },
    { value: `${analytics.avgProcessTimeMin} min`, label: 'Avg Process Time' }
  ];
}

export function mapTrendPoints(trends: TrendPointResponse[]): TrendItemState[] {
  return trends.map(t => ({ label: t.label, count: t.count }));
}

export function mapDonutSegments(breakdown: { percentage: number; color: string }[]): DonutSegmentState[] {
  const circ = 2 * Math.PI * 50;
  let offset = 0;
  return breakdown.map(cat => {
    const dash = (cat.percentage / 100) * circ;
    const seg: DonutSegmentState = { color: cat.color, dash, gap: circ - dash, offset: -offset };
    offset += dash;
    return seg;
  });
}

export function mapCategoryBreakdown(breakdown: CategoryBreakdownResponse[]): CategoryBreakdownState[] {
  return breakdown.map(cat => ({
    categoryKey: cat.categoryKey,
    categoryName: cat.categoryName,
    percentage: cat.percentage,
    color: cat.color
  }));
}

export function mapLocationToStoreStatus(location: LocationStatusResponse): StoreStatusState {
  return {
    id: location.id,
    name: location.name,
    address: location.address,
    status: location.status,
    donationsToday: location.donationsToday,
    itemsToday: location.itemsToday,
    staffCount: location.staffCount
  };
}

export function mapDonationToRecentRow(donation: RecentDonationResponse): RecentDonationState {
  const status = donation.status as DonationStatus;
  return {
    id: donation.id,
    receiptNumber: donation.receiptNumber,
    timestamp: donation.timestamp,
    donorName: donation.donorName ?? 'Anonymous',
    locationName: donation.locationName,
    totalItems: donation.totalItems,
    statusLabel: DonationStatusLabel[status],
    statusBadgeClass: status === DonationStatus.Completed ? 'badge-success' : 'badge-warning'
  };
}
