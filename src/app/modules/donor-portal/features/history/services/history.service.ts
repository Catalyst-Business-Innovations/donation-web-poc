import { Injectable, inject } from '@angular/core';
import { MockDataService } from '@core/services/mock-data.service';
import { DonationHistoryItemState, HistorySummaryState } from '../models/history.state';
import { mapDonationToHistoryItem, mapDonationsToSummary } from '../models/history.mapper';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private readonly mockData = inject(MockDataService);

  getDonations(year: number | null): DonationHistoryItemState[] {
    const donations = this.mockData.donations;
    const filtered = year === null ? donations : donations.filter(d => new Date(d.timestamp).getFullYear() === year);
    return filtered.map(mapDonationToHistoryItem);
  }

  getSummary(year: number | null): HistorySummaryState {
    const donations = this.mockData.donations;
    const filtered = year === null ? donations : donations.filter(d => new Date(d.timestamp).getFullYear() === year);
    return mapDonationsToSummary(filtered);
  }

  getDonor() {
    return this.mockData.donors[0];
  }
}
