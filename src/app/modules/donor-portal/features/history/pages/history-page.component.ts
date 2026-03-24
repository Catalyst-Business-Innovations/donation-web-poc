import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ToastService } from '@core/services/toast.service';
import { HistoryService } from '../services/history.service';
import { HistoryFiltersComponent } from '../components/history-filters/history-filters.component';
import { HistorySummaryCardsComponent } from '../components/history-summary-cards/history-summary-cards.component';
import { HistoryListComponent } from '../components/history-list/history-list.component';

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [DatePipe, IconComponent, HistoryFiltersComponent, HistorySummaryCardsComponent, HistoryListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './history-page.component.html',
  styleUrl: './history-page.component.scss'
})
export class HistoryPageComponent {
  private readonly historyService = inject(HistoryService);
  private readonly toast = inject(ToastService);

  protected readonly donor = this.historyService.getDonor();
  protected readonly years = [2026, 2025, 2024];
  protected readonly selectedYear = signal<number | null>(2026);
  protected readonly expandedId = signal<number | null>(null);

  protected readonly filteredDonations = computed(() => this.historyService.getDonations(this.selectedYear()));
  protected readonly summary = computed(() => this.historyService.getSummary(this.selectedYear()));

  onToggle(id: number): void {
    this.expandedId.update(cur => (cur === id ? null : id));
  }

  onDownloadAll(): void {
    this.toast.info('Export', 'Downloading history...');
  }

  onYearEndSummary(): void {
    this.toast.success('Receipt', 'Year-end summary generating...');
  }

  onDownloadReceipt(_id: number): void {
    this.toast.success('Downloaded', 'Receipt saved.');
  }
}
