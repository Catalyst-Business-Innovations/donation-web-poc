import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ContainerDetailState } from '../../models/containers.state';

@Component({
  selector: 'app-container-detail-panel',
  standalone: true,
  imports: [DatePipe, ModalComponent, IconComponent],
  templateUrl: './container-detail-panel.component.html',
  styleUrl: './container-detail-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainerDetailPanelComponent {
  readonly detail = input.required<ContainerDetailState | null>();

  readonly closed = output<void>();
  readonly editRequested = output<number>();
  readonly advanceRequested = output<number>();
  readonly resetRequested = output<number>();
}
