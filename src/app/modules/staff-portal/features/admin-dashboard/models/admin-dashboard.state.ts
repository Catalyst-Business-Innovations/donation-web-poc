export interface MetricCardState {
  value: string;
  label: string;
}

export interface TrendItemState {
  label: string;
  count: number;
}

export interface DonutSegmentState {
  color: string;
  dash: number;
  gap: number;
  offset: number;
}

export interface CategoryBreakdownState {
  categoryKey: string;
  categoryName: string;
  percentage: number;
  color: string;
}

export interface StoreStatusState {
  id: number;
  name: string;
  address: string;
  status: string;
  donationsToday: number;
  itemsToday: number;
  staffCount: number;
}

export interface RecentDonationState {
  id: number;
  receiptNumber: string;
  timestamp: Date;
  donorName: string;
  locationName: string;
  totalItems: number;
  statusLabel: string;
  statusBadgeClass: string;
}
