import { DonationStatus } from '../../../../../core/models/domain.models';

export interface DonationItemResponse {
  id: string;
  categoryKey: string;
  categoryName: string;
  quantity: number;
  estimatedValuePerItem: number;
  totalEstimatedValue: number;
}

export interface CreateDonationResponse {
  id: string;
  receiptNumber: string;
  status: DonationStatus;
  totalItems: number;
  totalEstimatedValue: number;
  loyaltyPointsEarned: number;
  items: DonationItemResponse[];
  timestamp: string;
}
