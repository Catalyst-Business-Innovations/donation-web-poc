import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { PresortStatsState, PresortQueueSummaryState } from '../../models/presort.state';

@Component({
  selector: 'app-presort-stats-bar',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './presort-stats-bar.component.html',
  styleUrl: './presort-stats-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PresortStatsBarComponent {
  readonly stats = input.required<PresortStatsState>();
  readonly queueSummary = input.required<PresortQueueSummaryState>();
}
