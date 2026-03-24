import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { IconComponent } from '@shared/components/icon/icon.component';
import type { IconName } from '@shared/components/icon/icon.component';
import { DonorTier, DonationScope, ReceiptDelivery } from '@core/models/domain.models';
import { SelectedDonor, ReviewItemState } from '../../models/new-donation.state';
import { DELIVERY_OPTIONS, PaymentMethodType } from '../../models/new-donation.enum';

export interface TierConfig {
  icon: IconName;
  label: string;
}

@Component({
  selector: 'app-review-step',
  standalone: true,
  imports: [FormsModule, DecimalPipe, IconComponent],
  templateUrl: './review-step.component.html',
  styleUrl: './review-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewStepComponent {
  readonly donor = input.required<SelectedDonor | null | undefined>();
  readonly donationType = input.required<DonationScope | null>();
  readonly totalItems = input.required<number>();
  readonly estPoints = input.required<number>();
  readonly reviewItems = input.required<ReviewItemState[]>();
  readonly monetary = input.required<number | null>();
  readonly paymentMethod = input.required<PaymentMethodType | null>();
  readonly cashTendered = input.required<number | null>();
  readonly cardApproved = input.required<boolean>();
  readonly cardDeclined = input.required<boolean>();
  readonly cardDeclineReason = input.required<string>();
  readonly cardTxnRef = input.required<string>();
  readonly delivery = input.required<ReceiptDelivery>();
  readonly canComplete = input.required<boolean>();
  readonly tierCfgFn = input.required<(t: DonorTier) => TierConfig>();

  readonly goBack = output<void>();
  readonly deliveryChanged = output<ReceiptDelivery>();
  readonly completed = output<void>();
  readonly cardRetry = output<void>();

  protected readonly DT = DonationScope;
  protected readonly deliveryOpts = DELIVERY_OPTIONS;

  protected getTierCfg(t: DonorTier): TierConfig {
    return this.tierCfgFn()(t);
  }

  protected onDeliveryChange(value: ReceiptDelivery): void {
    this.deliveryChanged.emit(value);
  }

  protected onComplete(): void {
    this.completed.emit();
  }

  protected onGoBack(): void {
    this.goBack.emit();
  }

  protected onCardRetry(): void {
    this.cardRetry.emit();
  }
}
