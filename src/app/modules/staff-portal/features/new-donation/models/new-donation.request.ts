import { PaymentMethod, ReceiptDelivery } from '../../../../../core/models/domain.models';

export interface DonationItemRequest {
  categoryKey: string;
  subCategoryKey?: string;
  quantity: number;
  estimatedValuePerItem?: number;
}

export interface CreateDonationRequest {
  donorId?: string;
  locationId: string;
  attendantId: string;
  items: DonationItemRequest[];
  isPreSorted: boolean;
  monetaryAmount?: number;
  paymentMethod?: PaymentMethod;
  receiptDelivery: ReceiptDelivery;
  notes?: string;
}
