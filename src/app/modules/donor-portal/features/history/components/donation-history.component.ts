import { Component, inject, signal, computed } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { MockDataService } from '../../../../../core/services/mock-data.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { HistoryMapper } from '../models/history.models';
import { DonationStatus, DonationStatusLabel } from '../../../../../core/models/domain.models';

@Component({
  selector: 'app-donation-history',
  standalone: true,
  imports: [DatePipe, DecimalPipe, IconComponent],
  templateUrl: './donation-history.component.html',
  styleUrl: './donation-history.component.scss'
})
export class DonationHistoryComponent {
  protected svc = inject(MockDataService);
  protected toast = inject(ToastService);
  protected donor = this.svc.donors[0];

  readonly years = [2026, 2025, 2024];
  selectedYear = signal<number | null>(2026);
  expandedId = signal<string | null>(null);

  readonly filteredDonations = computed(() => {
    const y = this.selectedYear();
    return this.svc.donations.filter(d => y === null || new Date(d.timestamp).getFullYear() === y);
  });

  readonly summary = computed(() => HistoryMapper.summarise(this.svc.donations, this.selectedYear()));

  toggle(id: string): void {
    this.expandedId.update(cur => (cur === id ? null : id));
  }
  protected readonly DS = DonationStatus;
  protected readonly DSL = DonationStatusLabel;
}
