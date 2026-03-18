import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { MockDataService } from '../../../../../core/services/mock-data.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { QrCodeComponent } from '../../../../../shared/components/qr-code/qr-code.component';
import {
  ScheduledDonation, DonationStatus, DonationMethod,
  DonationStatusLabel, DonationMethodLabel,
  Donation, Donor, DonorTier
} from '../../../../../core/models/domain.models';

@Component({
  selector: 'app-donations',
  standalone: true,
  imports: [FormsModule, DatePipe, DecimalPipe, ModalComponent, IconComponent, QrCodeComponent],
  templateUrl: './donations.component.html',
  styleUrl: './donations.component.scss'
})
export class DonationsComponent {
  protected mockData = inject(MockDataService);
  protected toast = inject(ToastService);
  private router = inject(Router);

  // expose for template
  protected readonly AS = DonationStatus;
  protected readonly AT = DonationMethod;
  protected readonly DS = DonationStatus;

  protected activeTab = signal<'scheduled-donations' | 'completions'>('scheduled-donations');

  protected query = '';
  protected statusFilter: DonationStatus | '' = '';
  protected dateFilter = '';

  // ── Completed-Donations tab ──────────────────────────────────────────────
  protected donQuery = '';
  protected _localDonations = signal<Donation[]>([...this.mockData.donations]);

  readonly filteredDonations = computed(() => {
    const q = this.donQuery.toLowerCase();
    return this._localDonations().filter(d => {
      return !q
        || (d.donorName ?? '').toLowerCase().includes(q)
        || d.id.toLowerCase().includes(q)
        || (d.associatedDonorName ?? '').toLowerCase().includes(q);
    });
  });

  // ── Link-Donor modal ─────────────────────────────────────────────────────
  protected linkingDonation = signal<Donation | null>(null);
  protected linkSearchQ = signal('');
  protected linkSelectedDonor = signal<Donor | null>(null);

  readonly linkResults = computed<Donor[]>(() => {
    const q = this.linkSearchQ().toLowerCase();
    if (q.length < 2) return [];
    return this.mockData.donors.filter(d =>
      `${d.firstName} ${d.lastName} ${d.phone}`.toLowerCase().includes(q)
    );
  });

  protected selected = signal<ScheduledDonation | null>(null);

  readonly allScheduledDonations = computed(() => this.mockData.getScheduledDonations());

  readonly filtered = computed(() => {
    const q = this.query.toLowerCase();
    return this.allScheduledDonations().filter(a => {
      const mQ = !q
        || a.donorName.toLowerCase().includes(q)
        || a.referenceNumber.toLowerCase().includes(q)
        || (a.locationName ?? '').toLowerCase().includes(q)
        || (a.notes ?? '').toLowerCase().includes(q);
      const mS = !this.statusFilter || a.status === this.statusFilter;
      const mD = !this.dateFilter || a.date.toISOString().startsWith(this.dateFilter);
      return mQ && mS && mD;
    });
  });

  readonly counts = computed(() => {
    const appts = this.allScheduledDonations();
    return {
      scheduled: appts.filter(a => a.status === DonationStatus.Scheduled).length,
      checkedIn: appts.filter(a => a.status === DonationStatus.CheckedIn).length,
      completed: appts.filter(a => a.status === DonationStatus.Completed).length,
      cancelled: appts.filter(a => a.status === DonationStatus.Cancelled).length,
      total: appts.length,
    };
  });

  statusLabel(s: DonationStatus): string {
    return DonationStatusLabel[s] ?? String(s);
  }

  statusBadge(s: DonationStatus): string {
    const m: Record<DonationStatus, string> = {
      [DonationStatus.Scheduled]: 'badge-info',
      [DonationStatus.CheckedIn]: 'badge-warning',
      [DonationStatus.Completed]: 'badge-success',
      [DonationStatus.Cancelled]: 'badge-danger',
      [DonationStatus.NoShow]:    'badge-gray',
    };
    return m[s] ?? 'badge-gray';
  }

  typeBadge(type: DonationMethod): string {
    const m: Record<DonationMethod, string> = {
      [DonationMethod.Scheduled]: 'badge-purple',
      [DonationMethod.WalkIn]:    'badge-gray',
      [DonationMethod.Pickup]:    'badge-warning',
    };
    return m[type] ?? 'badge-gray';
  }

  typeLabel(type: DonationMethod): string {
    return DonationMethodLabel[type] ?? String(type);
  }

  openDetail(a: ScheduledDonation): void {
    this.selected.set(a);
  }

  closeDetail(): void {
    this.selected.set(null);
  }

  checkIn(a: ScheduledDonation): void {
    this.toast.success('Checked In', `${a.donorName} has been checked in.`);
    this.selected.set(null);
    this.router.navigate(['/staff/new-donation']);
  }

  markComplete(a: ScheduledDonation): void {
    this.toast.success('Completed', `Scheduled donation ${a.referenceNumber} marked as completed.`);
    this.selected.set(null);
  }

  markCancelled(a: ScheduledDonation, event: Event): void {
    event.stopPropagation();
    this.toast.info('Cancelled', `Scheduled donation ${a.referenceNumber} cancelled.`);
  }

  // ── Link-Donor modal actions ──────────────────────────────────────────────
  openLinkModal(d: Donation, event: Event): void {
    event.stopPropagation();
    this.linkingDonation.set(d);
    this.linkSearchQ.set('');
    this.linkSelectedDonor.set(null);
  }

  closeLinkModal(): void {
    this.linkingDonation.set(null);
    this.linkSearchQ.set('');
    this.linkSelectedDonor.set(null);
  }

  confirmLink(): void {
    const donation = this.linkingDonation();
    const donor = this.linkSelectedDonor();
    if (!donation || !donor) return;
    const updated = this.mockData.associateDonorToDonation(donation.id, donor.id);
    if (updated) {
      this._localDonations.update(list =>
        list.map(d => d.id === updated.id ? updated : d)
      );
      this.toast.success('Linked!', `Donation ${donation.id} linked to ${donor.firstName} ${donor.lastName}.`);
    } else {
      this.toast.error('Failed', 'Could not link donor — the association window may have expired.');
    }
    this.closeLinkModal();
  }

  donationStatusBadge(s: DonationStatus): string {
    const m: Record<DonationStatus, string> = {
      [DonationStatus.Scheduled]:  'badge-info',
      [DonationStatus.CheckedIn]:  'badge-warning',
      [DonationStatus.Completed]:  'badge-success',
      [DonationStatus.Cancelled]:  'badge-danger',
      [DonationStatus.NoShow]:     'badge-gray',
    };
    return m[s] ?? 'badge-gray';
  }

}
