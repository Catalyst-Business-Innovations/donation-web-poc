import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { RewardCatalogueItemState } from '../../models/rewards.state';

@Component({
  selector: 'app-redeem-modal',
  standalone: true,
  imports: [DecimalPipe, IconComponent, ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './redeem-modal.component.html',
  styleUrl: './redeem-modal.component.scss'
})
export class RedeemModalComponent {
  reward = input.required<RewardCatalogueItemState | null>();
  donorPoints = input.required<number>();
  confirmed = output<void>();
  cancelled = output<void>();
}
