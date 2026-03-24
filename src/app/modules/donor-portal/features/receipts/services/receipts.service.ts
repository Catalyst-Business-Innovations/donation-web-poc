import { Injectable, inject } from '@angular/core';
import { MockDataService } from '@core/services/mock-data.service';
import { CurrentUserService } from '@core/services/current-user.service';
import { ReceiptListItemState, ReceiptDetailState } from '../models/receipts.state';
import { mapDonationToReceiptListItem, mapDonationToReceiptDetail } from '../models/receipts.mapper';

@Injectable({ providedIn: 'root' })
export class ReceiptsService {
  private readonly mockData = inject(MockDataService);
  private readonly currentUser = inject(CurrentUserService);

  getReceipts(): ReceiptListItemState[] {
    const donor = this.currentUser.donor();
    return this.mockData.getDonationsByDonor(donor.id).map(mapDonationToReceiptListItem);
  }

  getReceiptDetail(id: number): ReceiptDetailState | null {
    const donor = this.currentUser.donor();
    const donation = this.mockData.getDonationsByDonor(donor.id).find(d => d.id === id);
    if (!donation) return null;
    return mapDonationToReceiptDetail(donation, donor);
  }

  getDonorEmail(): string {
    return this.currentUser.donor().email;
  }
}
