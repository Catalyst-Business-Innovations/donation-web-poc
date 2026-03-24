import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { IconComponent } from '@shared/components/icon/icon.component';
import { DonorStatsState, TierDisplayState } from '../../models/dashboard.state';

@Component({
  selector: 'app-loyalty-hero',
  standalone: true,
  imports: [DecimalPipe, DatePipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './loyalty-hero.component.html',
  styleUrl: './loyalty-hero.component.scss',
})
export class LoyaltyHeroComponent {
  donor = input.required<DonorStatsState>();
  tierDisplay = input.required<TierDisplayState>();
}
