import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ContainerDest, ContainerType, ItemCondition, PresortMethod } from '@core/models/domain.models';
import { PresortFormState, PresortQueueItemState, PresortCategoryOptionState } from '../../models/presort.state';
import { CONTAINER_TYPE_OPTIONS, ROUTE_OPTIONS, SEASONAL_TAGS } from '../../models/presort.enum';
import {
  containerTypeIcon,
  computeTotalItemCount,
  hasSalvageItems,
  computeSalvageItemCount
} from '../../models/presort.mapper';
import { PresortItemRowComponent } from '../presort-item-row/presort-item-row.component';
import { IconName } from '@shared/components/icon/icon.component';

@Component({
  selector: 'app-presort-work-panel',
  standalone: true,
  imports: [FormsModule, IconComponent, PresortItemRowComponent],
  templateUrl: './presort-work-panel.component.html',
  styleUrl: './presort-work-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PresortWorkPanelComponent {
  readonly form = input.required<PresortFormState>();
  readonly activeQueueItem = input<PresortQueueItemState | undefined>();
  readonly categories = input.required<PresortCategoryOptionState[]>();

  readonly containerSelected = output<void>();
  readonly destChanged = output<ContainerDest>();
  readonly containerTypeChanged = output<ContainerType>();
  readonly presortMethodChanged = output<PresortMethod>();
  readonly seasonalChanged = output<boolean>();
  readonly seasonalTagChanged = output<string>();
  readonly ecommerceChanged = output<boolean>();
  readonly notesChanged = output<string>();
  readonly salvageWeightChanged = output<string>();
  readonly itemAdjusted = output<{ categoryKey: string; delta: number }>();
  readonly itemConditionChanged = output<{ categoryKey: string; condition: ItemCondition }>();
  readonly itemEcommerceQtyChanged = output<{ categoryKey: string; qty: number }>();
  readonly itemRemoved = output<string>();
  readonly categoryAdded = output<string>();
  readonly completeClicked = output<void>();
  readonly splitClicked = output<void>();
  readonly cancelClicked = output<void>();

  readonly containerTypeOptions = CONTAINER_TYPE_OPTIONS;
  readonly routeOptions = ROUTE_OPTIONS;
  readonly seasonalTags = SEASONAL_TAGS;
  readonly PM = PresortMethod;

  addCatKey = '';

  protected containerTypeIcon(type: ContainerType): IconName {
    return containerTypeIcon(type);
  }

  protected totalItemCount(): number {
    return computeTotalItemCount(this.form().items);
  }

  protected hasSalvage(): boolean {
    return hasSalvageItems(this.form().items);
  }

  protected salvageCount(): number {
    return computeSalvageItemCount(this.form().items);
  }

  onAddCategory(): void {
    if (!this.addCatKey) return;
    this.categoryAdded.emit(this.addCatKey);
    this.addCatKey = '';
  }
}
