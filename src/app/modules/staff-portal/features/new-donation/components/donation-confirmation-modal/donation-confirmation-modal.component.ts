import { Component, ChangeDetectionStrategy, input, output, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { IconComponent } from '@shared/components/icon/icon.component';
import type { IconName } from '@shared/components/icon/icon.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { QrCodeComponent } from '@shared/components/qr-code/qr-code.component';
import { DonorTier, DonationScope } from '@core/models/domain.models';
import { SelectedDonor } from '../../models/new-donation.state';
import { PaymentMethodType } from '../../models/new-donation.enum';

export interface TierConfig {
  icon: IconName;
  label: string;
}

@Component({
  selector: 'app-donation-confirmation-modal',
  standalone: true,
  imports: [FormsModule, DecimalPipe, DatePipe, IconComponent, ModalComponent, QrCodeComponent],
  templateUrl: './donation-confirmation-modal.component.html',
  styleUrl: './donation-confirmation-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DonationConfirmationModalComponent {
  readonly open = input.required<boolean>();
  readonly donationId = input.required<number>();
  readonly donationRefNumber = input.required<string>();
  readonly receiptNumber = input.required<string>();
  readonly donor = input.required<SelectedDonor | null | undefined>();
  readonly donationType = input.required<DonationScope | null>();
  readonly totalItems = input.required<number>();
  readonly estPoints = input.required<number>();
  readonly monetary = input.required<number | null>();
  readonly paymentMethod = input.required<PaymentMethodType | null>();
  readonly tierCfgFn = input.required<(t: DonorTier) => TierConfig>();

  readonly closed = output<void>();
  readonly associateDonor = output<void>();
  readonly confirmAssociation = output<SelectedDonor>();

  // Associate donor state (internal to this presentational component for search UX)
  protected showAssociateModal = signal(false);
  protected associateSearchQ = signal('');
  protected associatedDonor = signal<SelectedDonor | null>(null);

  // Search results are provided by the parent via this input
  readonly associateSearchResults = input.required<SelectedDonor[]>();
  readonly associateSearchChanged = output<string>();

  protected readonly today = new Date();
  protected readonly DT = DonationScope;

  protected getTierCfg(t: DonorTier): TierConfig {
    return this.tierCfgFn()(t);
  }

  protected onClose(): void {
    this.closed.emit();
  }

  protected onOpenAssociate(): void {
    this.showAssociateModal.set(true);
  }

  protected onAssociateSearchChange(q: string): void {
    this.associateSearchQ.set(q);
    this.associateSearchChanged.emit(q);
  }

  protected onSelectAssociateDonor(d: SelectedDonor): void {
    this.associatedDonor.set(d);
  }

  protected onConfirmAssociation(): void {
    const donor = this.associatedDonor();
    if (!donor) return;
    this.confirmAssociation.emit(donor);
    this.showAssociateModal.set(false);
    this.associateSearchQ.set('');
  }

  protected onCloseAssociateModal(): void {
    this.showAssociateModal.set(false);
    this.associatedDonor.set(null);
    this.associateSearchQ.set('');
  }
}
