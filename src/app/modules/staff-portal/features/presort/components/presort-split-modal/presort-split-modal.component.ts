import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { ItemCondition, ItemConditionLabel } from '@core/models/domain.models';
import { PresortWorkItemState } from '../../models/presort.state';

@Component({
  selector: 'app-presort-split-modal',
  standalone: true,
  imports: [ModalComponent, IconComponent],
  templateUrl: './presort-split-modal.component.html',
  styleUrl: './presort-split-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PresortSplitModalComponent {
  readonly open = input(false);
  readonly items = input.required<PresortWorkItemState[]>();
  readonly destinationLabel = input('TBD');

  readonly closed = output<void>();
  readonly confirmed = output<void>();

  readonly IC = ItemCondition;

  condLabel(c: ItemCondition): string {
    return ItemConditionLabel[c] ?? String(c);
  }
}
