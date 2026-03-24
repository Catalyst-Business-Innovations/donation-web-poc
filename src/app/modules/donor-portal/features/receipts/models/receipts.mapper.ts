import { Donation, Donor } from '@core/models/domain.models';
import { ReceiptListItemState, ReceiptDetailState } from './receipts.state';

export const mapDonationToReceiptListItem = (d: Donation): ReceiptListItemState => ({
  id: d.id,
  receiptNumber: d.receiptNumber,
  timestamp: d.timestamp,
  locationName: d.locationName,
  totalItems: d.totalItems,
});

export const mapDonationToReceiptDetail = (d: Donation, donor: Donor): ReceiptDetailState => ({
  receiptNumber: d.receiptNumber,
  timestamp: d.timestamp,
  locationName: d.locationName,
  totalItems: d.totalItems,
  donorFirstName: donor.firstName,
  donorLastName: donor.lastName,
  donorEmail: donor.email,
  donorPhone: donor.phone,
});
