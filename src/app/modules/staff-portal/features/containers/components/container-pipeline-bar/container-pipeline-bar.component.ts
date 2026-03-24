import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ContainerStatus } from '@core/models/domain.models';
import { IconComponent } from '@shared/components/icon/icon.component';
import { PipelineStageState } from '../../models/containers.state';

@Component({
  selector: 'app-container-pipeline-bar',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './container-pipeline-bar.component.html',
  styleUrl: './container-pipeline-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainerPipelineBarComponent {
  readonly stages = input.required<PipelineStageState[]>();
  readonly activeStatus = input.required<ContainerStatus | ''>();
  readonly stageClicked = output<ContainerStatus | ''>();

  onStageClick(status: ContainerStatus): void {
    this.stageClicked.emit(this.activeStatus() === status ? '' : status);
  }
}
