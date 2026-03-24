import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ContainerStatus, ContainerDest, ContainerType } from '@core/models/domain.models';
import { ModalComponent } from '@shared/components/modal/modal.component';
import {
  ContainerFormState,
  ContainerEditState,
  ContainerEditInfoState,
  DepartmentOption,
  CategoryOption,
  LocationOption
} from '../../models/containers.state';

@Component({
  selector: 'app-container-form-modal',
  standalone: true,
  imports: [FormsModule, DatePipe, ModalComponent],
  templateUrl: './container-form-modal.component.html',
  styleUrl: './container-form-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainerFormModalComponent {
  // ── Create mode inputs ───────────────────────────────────────────────────────
  readonly createOpen = input(false);
  readonly createForm = input<ContainerFormState | null>(null);
  readonly createDeptCats = input<CategoryOption[]>([]);

  // ── Edit mode inputs ─────────────────────────────────────────────────────────
  readonly editOpen = input(false);
  readonly editForm = input<ContainerEditState | null>(null);
  readonly editInfo = input<ContainerEditInfoState | null>(null);

  // ── Shared inputs ────────────────────────────────────────────────────────────
  readonly departments = input.required<DepartmentOption[]>();
  readonly locations = input.required<LocationOption[]>();

  // ── Outputs ──────────────────────────────────────────────────────────────────
  readonly createClosed = output<void>();
  readonly createConfirmed = output<ContainerFormState>();
  readonly createFormChanged = output<Partial<ContainerFormState>>();

  readonly editClosed = output<void>();
  readonly editConfirmed = output<ContainerEditState>();
  readonly editFormChanged = output<Partial<ContainerEditState>>();

  protected readonly CS = ContainerStatus;
  protected readonly CD = ContainerDest;
  protected readonly CT = ContainerType;

  onCreateConfirm(): void {
    const f = this.createForm();
    if (f) this.createConfirmed.emit(f);
  }

  onEditConfirm(): void {
    const f = this.editForm();
    if (f) this.editConfirmed.emit(f);
  }
}
