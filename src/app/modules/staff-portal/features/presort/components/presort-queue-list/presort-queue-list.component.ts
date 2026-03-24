import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { PresortQueueItemState } from '../../models/presort.state';
import { BacklogSeverity } from '../../models/presort.enum';

@Component({
  selector: 'app-presort-queue-list',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './presort-queue-list.component.html',
  styleUrl: './presort-queue-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PresortQueueListComponent {
  readonly queue = input.required<PresortQueueItemState[]>();
  readonly activeId = input<number | null>(null);
  readonly backlogSeverity = input.required<BacklogSeverity>();

  readonly selected = output<PresortQueueItemState>();
  readonly quickComplete = output<PresortQueueItemState>();

  onSelect(item: PresortQueueItemState): void {
    this.selected.emit(item);
  }

  onQuickComplete(item: PresortQueueItemState, event: Event): void {
    event.stopPropagation();
    this.quickComplete.emit(item);
  }
}
