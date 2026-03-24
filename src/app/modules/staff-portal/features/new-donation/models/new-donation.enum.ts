import { DonationStatus, ReceiptDelivery } from '@core/models/domain.models';
import { IconName } from '@shared/components/icon/icon.component';

export type PaymentMethodType = 'cash' | 'card';

export const PRESET_AMOUNTS = [5, 10, 25, 50, 100] as const;

export const DELIVERY_OPTIONS: { value: ReceiptDelivery; icon: IconName; label: string }[] = [
  { value: ReceiptDelivery.Print, icon: 'printer', label: 'Print' },
  { value: ReceiptDelivery.Email, icon: 'mail', label: 'Email' },
  { value: ReceiptDelivery.SMS, icon: 'send', label: 'SMS' }
];

export const SD_STATUS_BADGE_MAP: Record<DonationStatus, string> = {
  [DonationStatus.Scheduled]: 'badge-info',
  [DonationStatus.CheckedIn]: 'badge-warning',
  [DonationStatus.Completed]: 'badge-success',
  [DonationStatus.Cancelled]: 'badge-danger',
  [DonationStatus.NoShow]: 'badge-danger'
};
