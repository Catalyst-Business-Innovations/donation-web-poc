import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContainerStatus } from '@core/models/domain.models';
import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'app-container-filters',
  standalone: true,
  imports: [FormsModule, IconComponent],
  templateUrl: './container-filters.component.html',
  styleUrl: './container-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainerFiltersComponent {
  readonly query = input.required<string>();
  readonly statusFilter = input.required<ContainerStatus | ''>();
  readonly selectionCount = input.required<number>();

  readonly queryChanged = output<string>();
  readonly statusFilterChanged = output<ContainerStatus | ''>();
  readonly createClicked = output<void>();
  readonly printLabelsClicked = output<void>();
  readonly mergeClicked = output<void>();
  readonly bulkStatusClicked = output<void>();
  readonly clearSelectionClicked = output<void>();

  protected readonly CS = ContainerStatus;
}
