import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MockDataService } from '../../../../../core/services/mock-data.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { Donation } from '../../../../../core/models/domain.models';

@Component({
  selector: 'app-receipts',
  standalone: true,
  imports: [DatePipe, DecimalPipe, ModalComponent, IconComponent],
  templateUrl: './receipts.component.html',
  styleUrl: './receipts.component.scss'
})
export class ReceiptsComponent {
  protected svc = inject(MockDataService);
  protected toast = inject(ToastService);
  protected donor = this.svc.donors[0];
  protected selectedReceipt = signal<Donation | null>(null);

  readonly annuals = [
    { year: 2026, donations: 8, items: 142, value: 2840, ready: false },
    { year: 2025, donations: 18, items: 312, value: 6240, ready: true },
    { year: 2024, donations: 12, items: 204, value: 4080, ready: true },
    { year: 2023, donations: 4, items: 68, value: 1360, ready: true }
  ];

  readonly catTotals = [
    { icon: '👔', name: 'Clothing', value: 144 },
    { icon: '📚', name: 'Books', value: 25 },
    { icon: '🍳', name: 'Housewares', value: 32 },
    { icon: '🪑', name: 'Furniture', value: 250 },
    { icon: '📱', name: 'Electronics', value: 80 },
    { icon: '👟', name: 'Shoes', value: 60 }
  ];

  viewReceipt(donation: Donation): void {
    this.selectedReceipt.set(donation);
  }

  closeModal(): void {
    this.selectedReceipt.set(null);
  }

  downloadPDF(): void {
    this.toast.success('Download Started', 'Your receipt PDF is being generated...');
    this.closeModal();
  }

  emailReceipt(): void {
    this.toast.success('Email Sent', `Receipt sent to ${this.donor.email}`);
    this.closeModal();
  }
}
