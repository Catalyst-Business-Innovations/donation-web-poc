export interface ScheduledDonationState {
  id: number;
  referenceNumber: string;
  donorName: string;
  locationName: string;
  method: number;
  methodLabel: string;
  methodBadgeClass: string;
  status: number;
  statusLabel: string;
  statusBadgeClass: string;
  date: Date;
  time: string;
  itemCount: number | null;
  notes: string | null;
  donorPhone: string | null;
  categories: string[];
}

export interface ScheduledDonationDetailState {
  id: number;
  referenceNumber: string;
  donorName: string;
  donorPhone: string | null;
  donorEmail: string | null;
  address: string | null;
  locationName: string;
  method: number;
  methodLabel: string;
  methodBadgeClass: string;
  status: number;
  statusLabel: string;
  statusBadgeClass: string;
  date: Date;
  time: string;
  itemCount: number | null;
  categories: string[];
  recurring: string | null;
  notes: string | null;
  isScheduledStatus: boolean;
}

export interface CompletedDonationState {
  id: number;
  referenceNumber: string;
  receiptNumber: string;
  donorName: string | null;
  donorInitials: string | null;
  donorTier: number | null;
  donorTierLabel: string | null;
  donorTierBadgeClass: string | null;
  locationName: string;
  timestamp: Date;
  totalItems: number;
  totalEstimatedValue: number;
  statusLabel: string;
  statusBadgeClass: string;
  loyaltyPointsEarned: number | null;
  isAnonymous: boolean;
  associatedDonorName: string | null;
}

export interface DonationCountsState {
  scheduled: number;
  checkedIn: number;
  completed: number;
  cancelled: number;
  total: number;
}

export interface DonorSearchResultState {
  id: number;
  firstName: string;
  lastName: string;
  initials: string;
  phone: string;
  loyaltyPoints: number;
}
