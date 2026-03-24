import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ContainerRowState } from '../../models/containers.state';

@Component({
  selector: 'app-container-table',
  standalone: true,
  imports: [DatePipe, IconComponent],
  templateUrl: './container-table.component.html',
  styleUrl: './container-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainerTableComponent {
  readonly rows = input.required<ContainerRowState[]>();
  readonly selectedIds = input.required<Set<number>>();
  readonly allSelected = input.required<boolean>();

  readonly selectToggled = output<number>();
  readonly selectAllToggled = output<void>();
  readonly detailRequested = output<number>();
  readonly editRequested = output<number>();
  readonly advanceRequested = output<number>();
  readonly printRequested = output<number>();

  isSelected(id: number): boolean {
    return this.selectedIds().has(id);
  }
}
