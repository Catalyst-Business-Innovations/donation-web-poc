import { Injectable, inject } from '@angular/core';
import { MockDataService } from '@core/services/mock-data.service';
import { ReceiptListItemState, ReceiptDetailState } from '../models/receipts.state';
import { mapDonationToReceiptListItem, mapDonationToReceiptDetail } from '../models/receipts.mapper';

@Injectable({ providedIn: 'root' })
export class ReceiptsService {
  private readonly mockData = inject(MockDataService);

  getReceipts(): ReceiptListItemState[] {
    const donor = this.mockData.donors[0];
    return this.mockData.getDonationsByDonor(donor.id).map(mapDonationToReceiptListItem);
  }

  getReceiptDetail(id: number): ReceiptDetailState | null {
    const donor = this.mockData.donors[0];
    const donation = this.mockData.getDonationsByDonor(donor.id).find(d => d.id === id);
    if (!donation) return null;
    return mapDonationToReceiptDetail(donation, donor);
  }

  getDonorEmail(): string {
    return this.mockData.donors[0].email;
  }
}
