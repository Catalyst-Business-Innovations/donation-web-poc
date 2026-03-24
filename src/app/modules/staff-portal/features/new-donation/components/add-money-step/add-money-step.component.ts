import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '@shared/components/icon/icon.component';
import { PaymentMethodType, PRESET_AMOUNTS } from '../../models/new-donation.enum';

@Component({
  selector: 'app-add-money-step',
  standalone: true,
  imports: [FormsModule, IconComponent],
  templateUrl: './add-money-step.component.html',
  styleUrl: './add-money-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddMoneyStepComponent {
  readonly isCashAccepted = input.required<boolean>();
  readonly monetary = input.required<number | null>();
  readonly paymentMethod = input.required<PaymentMethodType | null>();
  readonly cashTendered = input.required<number | null>();
  readonly cardApproved = input.required<boolean>();
  readonly cardDeclined = input.required<boolean>();
  readonly cardDeclineReason = input.required<string>();

  readonly monetaryChanged = output<number | null>();
  readonly paymentMethodSelected = output<PaymentMethodType>();
  readonly cashTenderedChanged = output<number | null>();
  readonly cardRetry = output<void>();

  protected customMon = signal(false);
  protected readonly presets = PRESET_AMOUNTS;

  protected setMonetary(amt: number): void {
    this.customMon.set(false);
    this.monetaryChanged.emit(amt);
  }

  protected onCustomAmountInput(value: number | null): void {
    this.monetaryChanged.emit(value);
  }

  protected onSelectPaymentMethod(m: PaymentMethodType): void {
    this.paymentMethodSelected.emit(m);
  }

  protected onCashTenderedInput(value: number | null): void {
    this.cashTenderedChanged.emit(value);
  }

  protected onCardRetry(): void {
    this.cardRetry.emit();
  }
}
