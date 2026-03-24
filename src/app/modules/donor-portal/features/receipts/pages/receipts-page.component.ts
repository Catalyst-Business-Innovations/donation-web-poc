import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ToastService } from '@core/services/toast.service';
import { ReceiptsService } from '../services/receipts.service';
import { ReceiptsTableComponent } from '../components/receipts-table/receipts-table.component';
import { ReceiptDetailModalComponent } from '../components/receipt-detail-modal/receipt-detail-modal.component';
import { ReceiptDetailState } from '../models/receipts.state';

@Component({
  selector: 'app-receipts-page',
  standalone: true,
  imports: [IconComponent, ReceiptsTableComponent, ReceiptDetailModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './receipts-page.component.html',
  styleUrl: './receipts-page.component.scss',
})
export class ReceiptsPageComponent {
  private readonly receiptsService = inject(ReceiptsService);
  private readonly toast = inject(ToastService);

  protected readonly receipts = this.receiptsService.getReceipts();
  protected readonly selectedReceipt = signal<ReceiptDetailState | null>(null);

  onViewReceipt(id: number): void {
    this.selectedReceipt.set(this.receiptsService.getReceiptDetail(id));
  }

  onDownloadReceipt(_id: number): void {
    this.toast.success('Downloaded', 'Receipt saved.');
  }

  onEmailReceipt(_id: number): void {
    this.toast.success('Sent', `Receipt emailed to ${this.receiptsService.getDonorEmail()}`);
  }

  onYearEndSummary(): void {
    this.toast.success('Summary', '2025 summary generating...');
  }

  onModalDownloadPdf(): void {
    this.toast.success('Download Started', 'Your receipt PDF is being generated...');
    this.selectedReceipt.set(null);
  }

  onModalEmailReceipt(): void {
    this.toast.success('Email Sent', `Receipt sent to ${this.receiptsService.getDonorEmail()}`);
    this.selectedReceipt.set(null);
  }

  onModalClosed(): void {
    this.selectedReceipt.set(null);
  }
}
