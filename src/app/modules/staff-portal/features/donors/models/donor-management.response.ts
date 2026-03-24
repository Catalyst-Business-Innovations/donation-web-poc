import { DonorTier } from '@core/models/domain.models';

export interface DonorResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  loyaltyTier: DonorTier;
  loyaltyPoints: number;
  totalDonations: number;
  lifetimeValue: number;
  lastDonationDate?: Date;
  preferredLocationId?: number;
}

export interface DonorDonationResponse {
  id: number;
  locationName: string;
  timestamp: Date;
}
