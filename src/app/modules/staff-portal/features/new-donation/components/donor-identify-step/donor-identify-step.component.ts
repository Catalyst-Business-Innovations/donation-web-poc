import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { IconComponent } from '@shared/components/icon/icon.component';
import type { IconName } from '@shared/components/icon/icon.component';
import { DonorTier, DonationScope, DonationStatus, ScheduledDonation } from '@core/models/domain.models';
import { SelectedDonor, EnrollForm } from '../../models/new-donation.state';
import { SD_STATUS_BADGE_MAP } from '../../models/new-donation.enum';

export interface QuickDonateEvent {
  type: DonationScope;
}

export interface TierConfig {
  icon: IconName;
  label: string;
}

@Component({
  selector: 'app-donor-identify-step',
  standalone: true,
  imports: [FormsModule, DecimalPipe, DatePipe, IconComponent],
  templateUrl: './donor-identify-step.component.html',
  styleUrl: './donor-identify-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DonorIdentifyStepComponent {
  readonly searchResults = input.required<SelectedDonor[]>();
  readonly sdResults = input.required<ScheduledDonation[]>();
  readonly sdNotFound = input.required<boolean>();

  readonly donorSelected = output<SelectedDonor>();
  readonly anonymousSelected = output<void>();
  readonly donorEnrolled = output<EnrollForm>();
  readonly scanQR = output<void>();
  readonly quickDonate = output<QuickDonateEvent>();
  readonly scheduledLookup = output<string>();
  readonly scheduledScanQR = output<void>();
  readonly scheduledLoad = output<ScheduledDonation>();
  readonly searchChanged = output<string>();
  readonly demoSearchClicked = output<void>();

  protected searchQ = signal('');
  protected showEnroll = signal(false);
  protected sdQ = '';
  protected enrollForm: EnrollForm = { firstName: '', lastName: '', phone: '', email: '' };

  protected readonly AS = DonationStatus;
  protected readonly DT = DonationScope;

  tierCfg!: (t: DonorTier) => TierConfig;
  /** Set from parent via template — avoids injecting services in presentational component */
  readonly tierCfgFn = input.required<(t: DonorTier) => TierConfig>();

  protected getTierCfg(t: DonorTier): TierConfig {
    return this.tierCfgFn()(t);
  }

  protected onSearchChange(q: string): void {
    this.searchQ.set(q);
    this.searchChanged.emit(q);
  }

  protected onSelectDonor(d: SelectedDonor): void {
    this.donorSelected.emit(d);
    this.searchQ.set('');
  }

  protected onAnonymous(): void {
    this.anonymousSelected.emit();
  }

  protected onScanQR(): void {
    this.scanQR.emit();
  }

  protected onQuickDonate(type: DonationScope): void {
    this.quickDonate.emit({ type });
  }

  protected onScheduledLookup(): void {
    this.scheduledLookup.emit(this.sdQ);
  }

  protected onScheduledScanQR(): void {
    this.scheduledScanQR.emit();
  }

  protected onScheduledLoad(appt: ScheduledDonation): void {
    this.scheduledLoad.emit(appt);
    this.sdQ = '';
  }

  protected onOpenEnroll(): void {
    this.enrollForm = { firstName: '', lastName: '', phone: '', email: '' };
    this.showEnroll.set(true);
  }

  protected onEnroll(): void {
    this.donorEnrolled.emit({ ...this.enrollForm });
    this.showEnroll.set(false);
  }

  protected sdStatusBadge(status: DonationStatus): string {
    return SD_STATUS_BADGE_MAP[status] ?? 'badge-gray';
  }

  protected sdStatusLabel(s: DonationStatus): string {
    const labels: Record<DonationStatus, string> = {
      [DonationStatus.Scheduled]: 'Scheduled',
      [DonationStatus.CheckedIn]: 'Checked In',
      [DonationStatus.Completed]: 'Completed',
      [DonationStatus.Cancelled]: 'Cancelled',
      [DonationStatus.NoShow]: 'No Show'
    };
    return labels[s] ?? String(s);
  }
}
