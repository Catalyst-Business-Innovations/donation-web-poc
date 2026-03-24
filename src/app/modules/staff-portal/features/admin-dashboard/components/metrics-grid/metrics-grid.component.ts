import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MetricCardState } from '../../models/admin-dashboard.state';

@Component({
  selector: 'app-metrics-grid',
  standalone: true,
  templateUrl: './metrics-grid.component.html',
  styleUrl: './metrics-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetricsGridComponent {
  readonly metrics = input.required<MetricCardState[]>();
}
