import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

@Component({
  selector: 'app-history-filters',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './history-filters.component.html',
  styleUrl: './history-filters.component.scss',
})
export class HistoryFiltersComponent {
  years = input.required<number[]>();
  selectedYear = input.required<number | null>();
  yearChanged = output<number | null>();
}
