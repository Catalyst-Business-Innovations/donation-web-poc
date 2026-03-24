import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ItemCondition } from '@core/models/domain.models';
import { PresortWorkItemState } from '../../models/presort.state';
import { CONDITION_OPTIONS } from '../../models/presort.enum';

@Component({
  selector: 'app-presort-item-row',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './presort-item-row.component.html',
  styleUrl: './presort-item-row.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PresortItemRowComponent {
  readonly item = input.required<PresortWorkItemState>();
  readonly showEcommerce = input(false);

  readonly adjusted = output<number>();
  readonly conditionChanged = output<ItemCondition>();
  readonly ecommerceQtyChanged = output<number>();
  readonly removed = output<void>();

  readonly IC = ItemCondition;
  readonly conditions = CONDITION_OPTIONS;

  onAdjust(delta: number): void {
    this.adjusted.emit(delta);
  }

  onConditionChange(value: string): void {
    this.conditionChanged.emit(+value as ItemCondition);
  }

  onEcommerceQtyChange(value: string): void {
    this.ecommerceQtyChanged.emit(Math.max(0, +value));
  }

  onRemove(): void {
    this.removed.emit();
  }
}
