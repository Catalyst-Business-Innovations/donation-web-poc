import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PointsHeroState } from '../../models/rewards.state';

@Component({
  selector: 'app-points-hero',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './points-hero.component.html',
  styleUrl: './points-hero.component.scss'
})
export class PointsHeroComponent {
  hero = input.required<PointsHeroState>();
}
