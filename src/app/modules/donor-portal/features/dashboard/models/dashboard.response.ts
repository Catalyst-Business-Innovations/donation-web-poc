/**
 * API response models for donor dashboard.
 * Currently maps directly from core Donor/Campaign domain models.
 * When a real API replaces MockDataService, these interfaces define the expected contract.
 */
export interface DonorProfileResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  joinDate: string;
  totalDonations: number;
  loyaltyPoints: number;
  lifetimeValue: number;
  loyaltyTier: string;
}

export interface DashboardCampaignResponse {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
}
