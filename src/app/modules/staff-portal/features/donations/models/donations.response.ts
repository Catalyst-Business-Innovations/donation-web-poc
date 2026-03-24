import { DonationStatus, DonationMethod, DonorTier, DonationItem } from '@core/models/domain.models';

export interface ScheduledDonationResponse {
  id: number;
  referenceNumber: string;
  donorName: string;
  donorPhone?: string;
  donorEmail?: string;
  address?: string;
  locationName?: string;
  method: DonationMethod;
  date: Date;
  timeSlot: string;
  status: DonationStatus;
  itemCount?: number;
  categories?: string[];
  recurring?: string;
  notes?: string;
}

export interface CompletedDonationResponse {
  id: number;
  referenceNumber: string;
  receiptNumber: string;
  donorId?: number;
  donorName?: string;
  donorInitials?: string;
  donorTier?: DonorTier;
  locationName: string;
  timestamp: Date;
  status: DonationStatus;
  items: DonationItem[];
  totalItems: number;
  totalEstimatedValue: number;
  loyaltyPointsEarned?: number;
  associatedDonorName?: string;
}

export interface DonorSearchResponse {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  loyaltyPoints: number;
}
