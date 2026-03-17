import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { MockDataService } from '../../../../../core/services/mock-data.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { DonorLookupMapper, DonorLookupItem } from '../models/donor-lookup.models';
import { DonorTier, Donor } from '../../../../../core/models/domain.models';
import { NewDonationStateService } from '../../new-donation/services/new-donation-state.service';
import { NewDonationMapper } from '../../new-donation/models/new-donation.mapper';

type ModalMode = 'add' | 'edit' | 'history' | null;

interface EnrollForm {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
}

@Component({
  selector: 'app-donor-lookup',
  standalone: true,
  imports: [FormsModule, DatePipe, DecimalPipe, ModalComponent, IconComponent],
  templateUrl: './donor-lookup.component.html',
  styleUrl: './donor-lookup.component.scss'
})
export class DonorLookupComponent {
  protected mockData = inject(MockDataService);
  protected toast = inject(ToastService);
  private router = inject(Router);
  private donationState = inject(NewDonationStateService);

  protected query = '';
  protected tierFilter: DonorTier | '' = '';
  protected readonly DT = DonorTier;
  protected selected = signal<DonorLookupItem | null>(null);
  protected modalMode = signal<ModalMode>(null);
  protected enrollForm: EnrollForm = { firstName: '', lastName: '', phone: '', email: '', address: '' };

  readonly results = computed(() => DonorLookupMapper.filter(this.mockData.donors, this.query, this.tierFilter));

  tierCfg(t: DonorTier) {
    return this.mockData.getTier(t);
  }
  tierVariant(t: DonorTier): string {
    const map: Record<DonorTier, string> = {
      [DonorTier.Gold]:     'badge-warning',
      [DonorTier.Silver]:   'badge-gray',
      [DonorTier.Bronze]:   'badge-danger',
      [DonorTier.Platinum]: 'badge-purple'
    };
    return map[t] ?? 'badge-gray';
  }

  select(d: DonorLookupItem): void {
    this.selected.set(d);
  }
  close(): void {
    this.selected.set(null);
  }
  startDonation(d: DonorLookupItem): void {
    const fullDonor = this.mockData.donors.find(donor => donor.id === d.id);
    this.donationState.reset();
    if (fullDonor) {
      this.donationState.setDonor(NewDonationMapper.donorToSelected(fullDonor));
    } else {
      this.donationState.setDonor({ id: d.id, displayName: `${d.firstName} ${d.lastName}`,
        initials: `${d.firstName[0]}${d.lastName[0]}`.toUpperCase(),
        tier: d.loyaltyTier, points: d.loyaltyPoints, totalDonations: d.totalDonations });
    }
    this.donationState.goToStep(2);
    this.router.navigate(['/staff/new-donation']);
    this.toast.success('Donor Selected', `Starting donation for ${d.firstName} ${d.lastName}`);
  }

  // Modal actions
  openAddModal(): void {
    this.enrollForm = { firstName: '', lastName: '', phone: '', email: '', address: '' };
    this.modalMode.set('add');
  }

  openEditModal(d: DonorLookupItem): void {
    const donor = this.mockData.donors.find(donor => donor.id === d.id);
    if (donor) {
      this.enrollForm = {
        firstName: donor.firstName,
        lastName: donor.lastName,
        phone: donor.phone,
        email: donor.email,
        address: donor.address || ''
      };
      this.selected.set(d);
      this.modalMode.set('edit');
    }
  }

  openHistoryModal(d: DonorLookupItem): void {
    this.selected.set(d);
    this.modalMode.set('history');
  }

  closeModal(): void {
    this.modalMode.set(null);
  }

  saveEnrollment(): void {
    const { firstName, lastName, phone, email } = this.enrollForm;
    if (!firstName || !lastName || !phone) {
      this.toast.warning('Missing Info', 'First name, last name, and phone are required.');
      return;
    }

    const mode = this.modalMode();
    if (mode === 'add') {
      this.toast.success('Success!', `${firstName} ${lastName} has been enrolled.`);
    } else if (mode === 'edit') {
      this.toast.success('Saved!', `${firstName} ${lastName}'s information has been updated.`);
    }
    this.closeModal();
  }

  get modalTitle(): string {
    const mode = this.modalMode();
    if (mode === 'add') return '➕ Enroll New Donor';
    if (mode === 'edit') return '✏️ Edit Donor Information';
    if (mode === 'history') return '📜 Donation History';
    return '';
  }

  get confirmLabel(): string {
    const mode = this.modalMode();
    if (mode === 'add') return 'Enroll Donor';
    if (mode === 'edit') return 'Save Changes';
    return 'Close';
  }

  getDonorHistory() {
    const donor = this.selected();
    if (!donor) return [];
    return this.mockData.donations.filter(d => d.donorId === donor.id).slice(0, 10);
  }
}
