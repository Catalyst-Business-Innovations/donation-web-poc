import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Placeholder component for future label preview functionality.
 * Currently, label printing is handled directly by ContainerService.printLabel()
 * which opens a new browser window with the formatted label.
 */
@Component({
  selector: 'app-container-label-preview',
  standalone: true,
  templateUrl: './container-label-preview.component.html',
  styleUrl: './container-label-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainerLabelPreviewComponent {}
