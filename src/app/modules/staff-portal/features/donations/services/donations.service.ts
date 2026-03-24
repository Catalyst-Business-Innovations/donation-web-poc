import { Injectable, inject, signal } from '@angular/core';
import { MockDataService } from '@core/services/mock-data.service';
import { DonationMethod, DonationStatus, Donation } from '@core/models/domain.models';
import {
  ScheduledDonationState,
  ScheduledDonationDetailState,
  CompletedDonationState,
  DonationCountsState,
  DonorSearchResultState
} from '../models/donations.state';
import { ScheduledDonationResponse, CompletedDonationResponse } from '../models/donations.response';
import {
  mapScheduledDonationToState,
  mapScheduledDonationToDetailState,
  mapDonationToCompletedState,
  mapDonorToSearchResult,
  computeDonationCounts
} from '../models/donations.mapper';

@Injectable({ providedIn: 'root' })
export class DonationsService {
  private readonly mockData = inject(MockDataService);
  private readonly _localDonations = signal<Donation[]>([...this.mockData.donations]);

  getScheduledDonations(
    query: string,
    methodFilter: DonationMethod | '',
    statusFilter: DonationStatus | '',
    dateFilter: string
  ): ScheduledDonationState[] {
    const raw = this.mockData.getScheduledDonations();
    const q = query.toLowerCase();

    return raw
      .filter(a => {
        const mQ =
          !q ||
          a.donorName.toLowerCase().includes(q) ||
          a.referenceNumber.toLowerCase().includes(q) ||
          (a.locationName ?? '').toLowerCase().includes(q) ||
          (a.notes ?? '').toLowerCase().includes(q);
        const mM = !methodFilter || a.method === methodFilter;
        const mS = !statusFilter || a.status === statusFilter;
        const mD = !dateFilter || a.date.toISOString().startsWith(dateFilter);
        return mQ && mM && mS && mD;
      })
      .map(a => mapScheduledDonationToState(a as ScheduledDonationResponse));
  }

  getAllScheduledDonations(): ScheduledDonationResponse[] {
    return this.mockData.getScheduledDonations() as ScheduledDonationResponse[];
  }

  getCompletedDonations(query: string): CompletedDonationState[] {
    const q = query.toLowerCase();
    return this._localDonations()
      .filter(d => {
        return (
          !q ||
          (d.donorName ?? '').toLowerCase().includes(q) ||
          d.referenceNumber.toLowerCase().includes(q) ||
          (d.associatedDonorName ?? '').toLowerCase().includes(q)
        );
      })
      .map(d => mapDonationToCompletedState(d as CompletedDonationResponse));
  }

  getCounts(): DonationCountsState {
    const raw = this.mockData.getScheduledDonations();
    return computeDonationCounts(raw as ScheduledDonationResponse[]);
  }

  getScheduledDetail(id: number): ScheduledDonationDetailState | null {
    const raw = this.mockData.getScheduledDonations();
    const found = raw.find(a => a.id === id);
    if (!found) return null;
    return mapScheduledDonationToDetailState(found as ScheduledDonationResponse);
  }

  searchDonors(query: string): DonorSearchResultState[] {
    const q = query.toLowerCase();
    if (q.length < 2) return [];
    return this.mockData.donors
      .filter(d => `${d.firstName} ${d.lastName} ${d.phone}`.toLowerCase().includes(q))
      .map(d => mapDonorToSearchResult(d));
  }

  linkDonor(donationId: number, donorId: number): Donation | null {
    return this.mockData.associateDonorToDonation(donationId, donorId);
  }

  linkDonorAndRefresh(donationId: number, donorId: number): Donation | null {
    const updated = this.mockData.associateDonorToDonation(donationId, donorId);
    if (updated) {
      this._localDonations.update(list => list.map(d => (d.id === updated.id ? updated : d)));
    }
    return updated;
  }
}
