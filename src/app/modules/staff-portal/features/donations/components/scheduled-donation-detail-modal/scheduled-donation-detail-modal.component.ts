import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { QrCodeComponent } from '@shared/components/qr-code/qr-code.component';
import { ScheduledDonationDetailState } from '../../models/donations.state';

@Component({
  selector: 'app-scheduled-donation-detail-modal',
  standalone: true,
  imports: [DatePipe, ModalComponent, QrCodeComponent],
  templateUrl: './scheduled-donation-detail-modal.component.html',
  styleUrl: './scheduled-donation-detail-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScheduledDonationDetailModalComponent {
  readonly donation = input.required<ScheduledDonationDetailState | null>();
  readonly closed = output<void>();
  readonly cancelled = output<void>();
  readonly checkedIn = output<void>();
  readonly started = output<void>();
}
