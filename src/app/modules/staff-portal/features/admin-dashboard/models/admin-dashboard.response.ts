export interface AnalyticsMetricsResponse {
  totalDonations: number;
  activeDonors: number;
  avgProcessTimeMin: number;
}

export interface TrendPointResponse {
  label: string;
  count: number;
  value: number;
}

export interface CategoryBreakdownResponse {
  categoryKey: string;
  categoryName: string;
  color: string;
  count: number;
  percentage: number;
}

export interface LocationStatusResponse {
  id: number;
  name: string;
  address: string;
  status: string;
  donationsToday: number;
  itemsToday: number;
  staffCount: number;
}

export interface RecentDonationResponse {
  id: number;
  receiptNumber: string;
  donorName: string | null;
  locationName: string;
  timestamp: Date;
  totalItems: number;
  status: number;
}
