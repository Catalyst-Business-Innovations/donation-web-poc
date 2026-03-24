import { Donation, DonationStatus, DonationStatusLabel } from '@core/models/domain.models';
import { DonationHistoryItemState, HistorySummaryState } from './history.state';

export const mapDonationToHistoryItem = (d: Donation): DonationHistoryItemState => ({
  id: d.id,
  receiptNumber: d.receiptNumber,
  locationName: d.locationName,
  timestamp: d.timestamp,
  statusLabel: DonationStatusLabel[d.status],
  statusBadgeClass: d.status === DonationStatus.Completed ? 'badge-success' : 'badge-warning',
  totalItems: d.totalItems,
  loyaltyPointsEarned: d.loyaltyPointsEarned ?? 0,
  items: d.items.map(item => ({ categoryName: item.categoryName, quantity: item.quantity }))
});

export const mapDonationsToSummary = (donations: Donation[]): HistorySummaryState => ({
  donations: donations.length,
  items: donations.reduce((s, d) => s + d.totalItems, 0),
  points: donations.reduce((s, d) => s + (d.loyaltyPointsEarned ?? 0), 0)
});
