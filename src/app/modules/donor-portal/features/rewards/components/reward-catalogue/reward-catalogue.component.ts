import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { IconComponent } from '@shared/components/icon/icon.component';
import { RewardCatalogueItemState } from '../../models/rewards.state';

@Component({
  selector: 'app-reward-catalogue',
  standalone: true,
  imports: [DecimalPipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reward-catalogue.component.html',
  styleUrl: './reward-catalogue.component.scss'
})
export class RewardCatalogueComponent {
  rewards = input.required<RewardCatalogueItemState[]>();
  redeemClicked = output<RewardCatalogueItemState>();
  giftClicked = output<RewardCatalogueItemState>();
}
