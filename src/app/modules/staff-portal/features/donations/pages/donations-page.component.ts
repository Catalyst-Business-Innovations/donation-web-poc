import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '@core/services/toast.service';
import { MockDataService } from '@core/services/mock-data.service';
import { IconComponent } from '@shared/components/icon/icon.component';
import { DonationMethod, DonationStatus, Donation } from '@core/models/domain.models';
import { DonationsService } from '../services/donations.service';
import { DonationTab } from '../models/donations.enum';
import {
  ScheduledDonationDetailState,
  CompletedDonationState,
  DonorSearchResultState
} from '../models/donations.state';
import { DonationsTabBarComponent } from '../components/donations-tab-bar/donations-tab-bar.component';
import { DonationStatusCountsComponent } from '../components/donation-status-counts/donation-status-counts.component';
import { ScheduledDonationsTableComponent } from '../components/scheduled-donations-table/scheduled-donations-table.component';
import { ScheduledDonationDetailModalComponent } from '../components/scheduled-donation-detail-modal/scheduled-donation-detail-modal.component';
import { CompletedDonationsTableComponent } from '../components/completed-donations-table/completed-donations-table.component';
import { LinkDonorModalComponent } from '../components/link-donor-modal/link-donor-modal.component';

@Component({
  selector: 'app-donations-page',
  standalone: true,
  imports: [
    FormsModule,
    IconComponent,
    DonationsTabBarComponent,
    DonationStatusCountsComponent,
    ScheduledDonationsTableComponent,
    ScheduledDonationDetailModalComponent,
    CompletedDonationsTableComponent,
    LinkDonorModalComponent
  ],
  templateUrl: './donations-page.component.html',
  styleUrl: './donations-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DonationsPageComponent {
  private readonly donationsService = inject(DonationsService);
  protected readonly AT = DonationMethod;
  protected readonly DS = DonationStatus;
  private readonly mockData = inject(MockDataService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  // ── Tab state ──────────────────────────────────────────────────────────────
  protected readonly activeTab = signal<DonationTab>('scheduled-donations');

  // ── Scheduled tab filters ──────────────────────────────────────────────────
  protected readonly query = signal('');
  protected readonly methodFilter = signal<DonationMethod | ''>('');
  protected readonly statusFilter = signal<DonationStatus | ''>('');
  protected readonly dateFilter = signal('');

  // ── Scheduled tab computed ─────────────────────────────────────────────────
  readonly filteredScheduled = computed(() =>
    this.donationsService.getScheduledDonations(
      this.query(),
      this.methodFilter(),
      this.statusFilter(),
      this.dateFilter()
    )
  );

  readonly counts = computed(() => this.donationsService.getCounts());

  // ── Detail modal ───────────────────────────────────────────────────────────
  protected readonly selectedDetail = signal<ScheduledDonationDetailState | null>(null);

  // ── Completed tab ──────────────────────────────────────────────────────────
  protected readonly donQuery = signal('');
  private readonly _localDonations = signal<Donation[]>([...this.mockData.donations]);

  readonly filteredCompleted = computed(() =>
    this.donationsService.getCompletedDonations(this.donQuery(), this._localDonations())
  );

  // ── Link modal ─────────────────────────────────────────────────────────────
  protected readonly linkingDonation = signal<CompletedDonationState | null>(null);
  protected readonly linkSearchQ = signal('');

  readonly linkResults = computed<DonorSearchResultState[]>(() =>
    this.donationsService.searchDonors(this.linkSearchQ())
  );

  // ── Tab actions ────────────────────────────────────────────────────────────
  onTabChanged(tab: DonationTab): void {
    this.activeTab.set(tab);
  }

  onStatusClicked(status: DonationStatus | ''): void {
    this.statusFilter.set(status);
  }

  // ── Scheduled donation actions ─────────────────────────────────────────────
  onViewScheduled(id: number): void {
    const detail = this.donationsService.getScheduledDetail(id);
    this.selectedDetail.set(detail);
  }

  onCancelScheduled(id: number): void {
    const detail = this.donationsService.getScheduledDetail(id);
    if (detail) {
      this.toast.info('Cancelled', `Scheduled donation ${detail.referenceNumber} cancelled.`);
    }
  }

  onCheckInScheduled(): void {
    const detail = this.selectedDetail();
    if (detail) {
      this.toast.success('Checked In', `${detail.donorName} has been checked in.`);
      this.selectedDetail.set(null);
      this.router.navigate(['/staff/new-donation']);
    }
  }

  onStartScheduled(): void {
    const detail = this.selectedDetail();
    if (detail) {
      this.toast.success('Completed', `Scheduled donation ${detail.referenceNumber} marked as completed.`);
      this.selectedDetail.set(null);
    }
  }

  onCloseDetail(): void {
    this.selectedDetail.set(null);
  }

  // ── Link donor actions ─────────────────────────────────────────────────────
  onLinkRequested(donationId: number): void {
    const donation = this.filteredCompleted().find(d => d.id === donationId);
    if (donation) {
      this.linkingDonation.set(donation);
      this.linkSearchQ.set('');
    }
  }

  onLinkClosed(): void {
    this.linkingDonation.set(null);
    this.linkSearchQ.set('');
  }

  onLinkConfirmed(donorId: number): void {
    const donation = this.linkingDonation();
    if (!donation) return;

    const updated = this.donationsService.linkDonor(donation.id, donorId);
    if (updated) {
      this._localDonations.update(list => list.map(d => (d.id === updated.id ? updated : d)));
      const donor = this.linkResults().find(d => d.id === donorId);
      this.toast.success(
        'Linked!',
        `Donation ${donation.referenceNumber} linked to ${donor?.firstName ?? ''} ${donor?.lastName ?? ''}.`
      );
    } else {
      this.toast.error('Failed', 'Could not link donor \u2014 the association window may have expired.');
    }
    this.onLinkClosed();
  }
}
