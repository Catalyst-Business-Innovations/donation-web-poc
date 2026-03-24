import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ScheduledVisitState } from '../../models/schedule.state';

@Component({
  selector: 'app-upcoming-visits-list',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './upcoming-visits-list.component.html',
  styleUrl: './upcoming-visits-list.component.scss'
})
export class UpcomingVisitsListComponent {
  visits = input.required<ScheduledVisitState[]>();
  visitSelected = output<ScheduledVisitState>();
  cancelRequested = output<ScheduledVisitState>();
}
