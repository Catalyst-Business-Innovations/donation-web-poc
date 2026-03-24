import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { ItemCondition } from '@core/models/domain.models';
import { PresortConfirmState } from '../../models/presort.state';
import { ItemConditionLabel } from '@core/models/domain.models';

@Component({
  selector: 'app-presort-confirm-modal',
  standalone: true,
  imports: [ModalComponent, IconComponent],
  templateUrl: './presort-confirm-modal.component.html',
  styleUrl: './presort-confirm-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PresortConfirmModalComponent {
  readonly open = input(false);
  readonly confirmState = input.required<PresortConfirmState | null>();

  readonly closed = output<void>();
  readonly confirmed = output<void>();

  readonly IC = ItemCondition;

  condLabel(c: ItemCondition): string {
    return ItemConditionLabel[c] ?? String(c);
  }
}
