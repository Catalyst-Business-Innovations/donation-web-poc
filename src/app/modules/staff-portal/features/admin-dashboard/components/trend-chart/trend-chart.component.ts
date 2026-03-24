import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { TrendItemState } from '../../models/admin-dashboard.state';

@Component({
  selector: 'app-trend-chart',
  standalone: true,
  templateUrl: './trend-chart.component.html',
  styleUrl: './trend-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrendChartComponent {
  readonly trends = input.required<TrendItemState[]>();

  readonly maxCount = computed(() => Math.max(...this.trends().map(t => t.count)));

  barHeight(count: number): string {
    return (count / this.maxCount()) * 100 + '%';
  }
}
