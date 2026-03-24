import { Injectable, inject } from '@angular/core';
import { MockDataService } from '@core/services/mock-data.service';
import {
  DonorTier,
  DonationStatus,
  Container,
  ContainerStatus,
  ContainerStatusLabel,
  ContainerTypeLabel,
  ContainerType,
  DonationStatusLabel,
  ScheduledDonation,
  DonationDepartment,
  Donor
} from '@core/models/domain.models';
import { SelectedDonor } from '../models/new-donation.state';
import { mapDonorToSelected } from '../models/new-donation.mapper';

@Injectable({ providedIn: 'root' })
export class NewDonationService {
  private readonly mockData = inject(MockDataService);

  get departments(): DonationDepartment[] {
    return this.mockData.departments;
  }

  get donors(): Donor[] {
    return this.mockData.donors;
  }

  get containers(): Container[] {
    return this.mockData.containers;
  }

  isCashAccepted(): boolean {
    return this.mockData.appConfig().isCashAccepted;
  }

  newReceipt(): string {
    return this.mockData.newReceipt();
  }

  getTierConfig(tier: DonorTier) {
    return this.mockData.getTier(tier);
  }

  searchDonors(query: string): SelectedDonor[] {
    const q = query.toLowerCase();
    if (q.length < 2) return [];
    return this.mockData.donors
      .filter(d => `${d.firstName} ${d.lastName} ${d.phone}`.toLowerCase().includes(q))
      .map(mapDonorToSelected);
  }

  getAvailableContainers(query: string): Container[] {
    const q = query.toLowerCase();
    return this.mockData.containers
      .filter(
        c =>
          c.status === ContainerStatus.Available ||
          c.status === ContainerStatus.ReadyForSorting ||
          c.status === ContainerStatus.Sorting
      )
      .filter(
        c =>
          !q ||
          c.barcode.toLowerCase().includes(q) ||
          (c.donorVisitLabel ?? '').toLowerCase().includes(q) ||
          String(c.containerType).toLowerCase().includes(q)
      );
  }

  lookupScheduledDonations(query: string): ScheduledDonation[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const qDigits = q.replace(/\D/g, '');
    return this.mockData
      .getScheduledDonations()
      .filter(
        a =>
          a.referenceNumber.toLowerCase().includes(q) ||
          a.donorName.toLowerCase().includes(q) ||
          (qDigits.length >= 3 && (a.donorPhone ?? '').replace(/\D/g, '').includes(qDigits))
      );
  }

  getFirstScheduledDonation(): ScheduledDonation | null {
    const scheduled = this.mockData.getScheduledDonations().filter(a => a.status === DonationStatus.Scheduled);
    return scheduled.length ? scheduled[0] : null;
  }

  findDonorById(donorId: number): Donor | undefined {
    return this.mockData.donors.find(d => d.id === donorId);
  }

  getRandomDonor(): Donor | null {
    const donors = this.mockData.donors;
    if (!donors.length) return null;
    return donors[Math.floor(Math.random() * donors.length)];
  }

  associateDonorToDonation(donationId: number, donorId: number): void {
    this.mockData.associateDonorToDonation(donationId, donorId);
  }

  containerTypeLabel(t: ContainerType): string {
    return ContainerTypeLabel[t] ?? String(t);
  }

  containerStatusLabel(s: ContainerStatus): string {
    return ContainerStatusLabel[s] ?? String(s);
  }

  donationStatusLabel(s: DonationStatus): string {
    return DonationStatusLabel[s] ?? String(s);
  }
}
