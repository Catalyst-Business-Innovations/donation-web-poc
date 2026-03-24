/**
 * API response models for donation history.
 * Currently maps directly from core Donation/DonationItem domain models.
 * When a real API replaces MockDataService, these interfaces define the expected contract.
 */
export interface DonationHistoryResponse {
  id: number;
  referenceNumber: string;
  receiptNumber: string;
  locationName: string;
  timestamp: string;
  status: string;
  totalItems: number;
  totalEstimatedValue: number;
  loyaltyPointsEarned?: number;
  items: DonationHistoryItemResponse[];
}

export interface DonationHistoryItemResponse {
  categoryName: string;
  quantity: number;
}
