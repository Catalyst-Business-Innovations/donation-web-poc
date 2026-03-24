import { Injectable, inject } from '@angular/core';
import { MockDataService } from '@core/services/mock-data.service';
import { CurrentDonorService } from '@core/services/current-donor.service';
import { ReceiptListItemState, ReceiptDetailState } from '../models/receipts.state';
import { mapDonationToReceiptListItem, mapDonationToReceiptDetail } from '../models/receipts.mapper';

@Injectable({ providedIn: 'root' })
export class ReceiptsService {
  private readonly mockData = inject(MockDataService);
  private readonly currentDonor = inject(CurrentDonorService);

  getReceipts(): ReceiptListItemState[] {
    const donor = this.currentDonor.donor();
    return this.mockData.getDonationsByDonor(donor.id).map(mapDonationToReceiptListItem);
  }

  getReceiptDetail(id: number): ReceiptDetailState | null {
    const donor = this.currentDonor.donor();
    const donation = this.mockData.getDonationsByDonor(donor.id).find(d => d.id === id);
    if (!donation) return null;
    return mapDonationToReceiptDetail(donation, donor);
  }

  getDonorEmail(): string {
    return this.currentDonor.donor().email;
  }
}
