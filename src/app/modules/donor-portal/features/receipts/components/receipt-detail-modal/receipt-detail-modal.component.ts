import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { ReceiptDetailState } from '../../models/receipts.state';

@Component({
  selector: 'app-receipt-detail-modal',
  standalone: true,
  imports: [DatePipe, IconComponent, ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './receipt-detail-modal.component.html',
  styleUrl: './receipt-detail-modal.component.scss',
})
export class ReceiptDetailModalComponent {
  receipt = input.required<ReceiptDetailState | null>();
  closed = output<void>();
  downloadPdf = output<void>();
  emailReceipt = output<void>();
}
