import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ImpactItemState } from '../../models/dashboard.state';

@Component({
  selector: 'app-impact-summary',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './impact-summary.component.html',
  styleUrl: './impact-summary.component.scss'
})
export class ImpactSummaryComponent {
  items = input.required<ImpactItemState[]>();
}
