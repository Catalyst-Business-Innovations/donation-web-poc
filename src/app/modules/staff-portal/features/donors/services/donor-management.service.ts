import { Injectable, inject } from '@angular/core';
import { MockDataService } from '@core/services/mock-data.service';
import { DonorTier } from '@core/models/domain.models';
import { DonorListItemState, DonorDetailState } from '../models/donor-management.state';
import { DonorFormState } from '../models/donor-management.state';
import {
  mapDonorToListItem,
  mapDonorToDetail,
  mapDonorToForm,
  emptyDonorForm
} from '../models/donor-management.mapper';

@Injectable({ providedIn: 'root' })
export class DonorManagementService {
  private readonly mockData = inject(MockDataService);

  getDonors(query: string, tierFilter: DonorTier | ''): DonorListItemState[] {
    const q = query.toLowerCase();
    return this.mockData.donors
      .filter(d => {
        const matchesQuery = !q || `${d.firstName} ${d.lastName} ${d.phone} ${d.email}`.toLowerCase().includes(q);
        return matchesQuery && (!tierFilter || d.loyaltyTier === tierFilter);
      })
      .map(d => mapDonorToListItem(d, this.mockData.getTier(d.loyaltyTier)));
  }

  getDonorDetail(id: number): DonorDetailState | null {
    const donor = this.mockData.getDonorById(id);
    if (!donor) return null;
    const tierConfig = this.mockData.getTier(donor.loyaltyTier);
    const recentDonations = this.mockData
      .getDonationsByDonor(id)
      .slice(0, 3)
      .map(d => ({ locationName: d.locationName, timestamp: d.timestamp }));
    return mapDonorToDetail(donor, tierConfig, recentDonations);
  }

  getDonorForm(id: number): DonorFormState {
    const donor = this.mockData.getDonorById(id);
    return donor ? mapDonorToForm(donor) : emptyDonorForm();
  }

  createDonor(form: DonorFormState): void {
    this.mockData.addDonor({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      preferredLocationId: this.mockData.session.locationId
    });
  }

  updateDonor(id: number, form: DonorFormState): void {
    this.mockData.updateDonor(id, {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim()
    });
  }

  getTotalDonorCount(): number {
    return this.mockData.donors.length;
  }
}
