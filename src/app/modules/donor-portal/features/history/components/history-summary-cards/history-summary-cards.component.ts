import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { HistorySummaryState } from '../../models/history.state';

@Component({
  selector: 'app-history-summary-cards',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './history-summary-cards.component.html',
  styleUrl: './history-summary-cards.component.scss'
})
export class HistorySummaryCardsComponent {
  summary = input.required<HistorySummaryState>();
  yearEndSummaryRequested = output<void>();
}
