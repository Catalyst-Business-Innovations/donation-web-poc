import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContainerDest, ContainerType } from '@core/models/domain.models';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { MergeFormState, DepartmentOption, CategoryOption, LocationOption } from '../../models/containers.state';

@Component({
  selector: 'app-container-merge-modal',
  standalone: true,
  imports: [FormsModule, ModalComponent, IconComponent],
  templateUrl: './container-merge-modal.component.html',
  styleUrl: './container-merge-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainerMergeModalComponent {
  readonly open = input(false);
  readonly form = input<MergeFormState | null>(null);
  readonly selectionCount = input(0);
  readonly mergeTotal = input(0);
  readonly departments = input.required<DepartmentOption[]>();
  readonly deptCats = input<CategoryOption[]>([]);
  readonly locations = input.required<LocationOption[]>();

  readonly closed = output<void>();
  readonly confirmed = output<MergeFormState>();
  readonly formChanged = output<Partial<MergeFormState>>();

  protected readonly CD = ContainerDest;
  protected readonly CT = ContainerType;

  onConfirm(): void {
    const f = this.form();
    if (f) this.confirmed.emit(f);
  }
}
