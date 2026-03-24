import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { TierProgressState } from '../../models/rewards.state';

@Component({
  selector: 'app-tier-progress-card',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tier-progress-card.component.html',
  styleUrl: './tier-progress-card.component.scss'
})
export class TierProgressCardComponent {
  progress = input.required<TierProgressState>();
}
