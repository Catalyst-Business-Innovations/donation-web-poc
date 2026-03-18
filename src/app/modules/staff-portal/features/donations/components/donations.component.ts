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
  ScheduledAppointment, AppointmentStatus, AppointmentType,
  AppointmentStatusLabel, AppointmentTypeLabel,
  Donation, DonationStatus, Donor, DonorTier
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
  protected readonly AS = AppointmentStatus;
  protected readonly AT = AppointmentType;
  protected readonly DS = DonationStatus;

  protected activeTab = signal<'appointments' | 'completions'>('appointments');

  protected query = '';
  protected statusFilter: AppointmentStatus | '' = '';
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

  protected selected = signal<ScheduledAppointment | null>(null);

  readonly allAppointments = computed(() => this.mockData.getAppointments());

  readonly filtered = computed(() => {
    const q = this.query.toLowerCase();
    return this.allAppointments().filter(a => {
      const mQ = !q
        || a.donorName.toLowerCase().includes(q)
        || a.id.toLowerCase().includes(q)
        || (a.locationName ?? '').toLowerCase().includes(q)
        || (a.notes ?? '').toLowerCase().includes(q);
      const mS = !this.statusFilter || a.status === this.statusFilter;
      const mD = !this.dateFilter || a.date.toISOString().startsWith(this.dateFilter);
      return mQ && mS && mD;
    });
  });

  readonly counts = computed(() => {
    const appts = this.allAppointments();
    return {
      scheduled: appts.filter(a => a.status === AppointmentStatus.Scheduled).length,
      checkedIn: appts.filter(a => a.status === AppointmentStatus.CheckedIn).length,
      completed: appts.filter(a => a.status === AppointmentStatus.Completed).length,
      cancelled: appts.filter(a => a.status === AppointmentStatus.Cancelled).length,
      total: appts.length,
    };
  });

  statusLabel(s: AppointmentStatus): string {
    return AppointmentStatusLabel[s] ?? String(s);
  }

  statusBadge(s: AppointmentStatus): string {
    const m: Record<AppointmentStatus, string> = {
      [AppointmentStatus.Scheduled]: 'badge-info',
      [AppointmentStatus.CheckedIn]: 'badge-warning',
      [AppointmentStatus.Completed]: 'badge-success',
      [AppointmentStatus.Cancelled]: 'badge-danger',
      [AppointmentStatus.NoShow]:    'badge-gray',
    };
    return m[s] ?? 'badge-gray';
  }

  typeBadge(type: AppointmentType): string {
    const m: Record<AppointmentType, string> = {
      [AppointmentType.Scheduled]: 'badge-purple',
      [AppointmentType.WalkIn]:    'badge-gray',
      [AppointmentType.Pickup]:    'badge-warning',
    };
    return m[type] ?? 'badge-gray';
  }

  typeLabel(type: AppointmentType): string {
    return AppointmentTypeLabel[type] ?? String(type);
  }

  openDetail(a: ScheduledAppointment): void {
    this.selected.set(a);
  }

  closeDetail(): void {
    this.selected.set(null);
  }

  checkIn(a: ScheduledAppointment): void {
    this.toast.success('Checked In', `${a.donorName} has been checked in.`);
    this.selected.set(null);
    this.router.navigate(['/staff/new-donation']);
  }

  markComplete(a: ScheduledAppointment): void {
    this.toast.success('Completed', `Appointment ${a.id} marked as completed.`);
    this.selected.set(null);
  }

  markCancelled(a: ScheduledAppointment, event: Event): void {
    event.stopPropagation();
    this.toast.info('Cancelled', `Appointment ${a.id} cancelled.`);
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
      [DonationStatus.Pending]:    'badge-info',
      [DonationStatus.Processing]: 'badge-warning',
      [DonationStatus.Completed]:  'badge-success',
      [DonationStatus.Cancelled]:  'badge-danger',
    };
    return m[s] ?? 'badge-gray';
  }

}
