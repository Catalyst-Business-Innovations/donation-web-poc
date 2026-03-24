import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContainerStatus } from '@core/models/domain.models';
import { ModalComponent } from '@shared/components/modal/modal.component';

@Component({
  selector: 'app-container-bulk-status-modal',
  standalone: true,
  imports: [FormsModule, ModalComponent],
  templateUrl: './container-bulk-status-modal.component.html',
  styleUrl: './container-bulk-status-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainerBulkStatusModalComponent {
  readonly open = input(false);
  readonly selectionCount = input(0);
  readonly bulkStatus = input<ContainerStatus>(ContainerStatus.InUse);

  readonly closed = output<void>();
  readonly confirmed = output<ContainerStatus>();
  readonly statusChanged = output<ContainerStatus>();

  protected readonly CS = ContainerStatus;
}
