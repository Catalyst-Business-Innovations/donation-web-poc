/**
 * API response models for tax receipts.
 * Currently maps directly from core Donation domain model.
 * When a real API replaces MockDataService, these interfaces define the expected contract.
 */
export interface ReceiptResponse {
  id: number;
  receiptNumber: string;
  timestamp: string;
  locationName: string;
  totalItems: number;
  totalEstimatedValue: number;
  donorFirstName: string;
  donorLastName: string;
  donorEmail: string;
  donorPhone: string;
}
