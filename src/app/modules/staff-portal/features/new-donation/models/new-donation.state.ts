import { DonorTier, DonationScope, ReceiptDelivery } from '../../../../../core/models/domain.models';

export type WizardStep = 1 | 2 | 3 | 4 | 5;

export interface SelectedDonor {
  id: number;
  displayName: string;
  initials: string;
  tier: DonorTier;
  points: number;
  totalDonations: number;
  phone?: string;
}

export interface SelectedItemEntry {
  qty: number;
  estimatedValue?: number;
}

export type SelectedItemsMap = Record<string, SelectedItemEntry>;

export interface NewDonationState {
  step: WizardStep;
  donationType: DonationScope | null;
  donor: SelectedDonor | null | undefined;
  selectedItems: SelectedItemsMap;
  monetaryAmount: number | null;
  receiptDelivery: ReceiptDelivery;
  isPreSorted: boolean;
  notes: string;
}

export interface EnrollForm {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}
