import { AsyncStatus } from '@core/models/async-status.type';

export interface DonationHistoryItemState {
  id: number;
  receiptNumber: string;
  locationName: string;
  timestamp: Date;
  statusLabel: string;
  statusBadgeClass: string;
  totalItems: number;
  loyaltyPointsEarned: number;
  items: { categoryName: string; quantity: number }[];
}

export interface HistorySummaryState {
  donations: number;
  items: number;
  points: number;
}

export interface HistoryPageState {
  donations: DonationHistoryItemState[];
  summary: HistorySummaryState;
  status: AsyncStatus;
  error?: string;
}
