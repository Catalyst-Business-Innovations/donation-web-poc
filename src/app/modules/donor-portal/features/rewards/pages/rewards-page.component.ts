import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ToastService } from '@core/services/toast.service';
import { DonorRewardsService } from '../services/donor-rewards.service';
import { PointsHeroComponent } from '../components/points-hero/points-hero.component';
import { TierProgressCardComponent } from '../components/tier-progress-card/tier-progress-card.component';
import { RewardCatalogueComponent } from '../components/reward-catalogue/reward-catalogue.component';
import { TransactionHistoryListComponent } from '../components/transaction-history-list/transaction-history-list.component';
import { RedeemModalComponent } from '../components/redeem-modal/redeem-modal.component';
import { GiftModalComponent } from '../components/gift-modal/gift-modal.component';
import { RewardCatalogueItemState } from '../models/rewards.state';

@Component({
  selector: 'app-rewards-page',
  standalone: true,
  imports: [
    DecimalPipe,
    PointsHeroComponent,
    TierProgressCardComponent,
    RewardCatalogueComponent,
    TransactionHistoryListComponent,
    RedeemModalComponent,
    GiftModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rewards-page.component.html',
  styleUrl: './rewards-page.component.scss',
})
export class RewardsPageComponent {
  private readonly rewardsService = inject(DonorRewardsService);
  private readonly toast = inject(ToastService);

  protected readonly heroState = this.rewardsService.getHeroState();
  protected readonly tierProgress = this.rewardsService.getTierProgress();
  protected readonly catalogue = this.rewardsService.catalogue;
  protected readonly txnHistory = this.rewardsService.txnHistory;
  protected readonly donorPoints = this.rewardsService.getDonorPoints();

  protected readonly selectedRedeemReward = signal<RewardCatalogueItemState | null>(null);
  protected readonly selectedGiftReward = signal<RewardCatalogueItemState | null>(null);
  protected readonly giftSearchQuery = signal('');

  protected readonly giftSearchResults = computed(() =>
    this.rewardsService.searchDonors(this.giftSearchQuery())
  );

  onRedeemClicked(reward: RewardCatalogueItemState): void {
    this.selectedRedeemReward.set(reward);
  }

  onGiftClicked(reward: RewardCatalogueItemState): void {
    this.selectedGiftReward.set(reward);
  }

  onRedeemConfirmed(): void {
    const reward = this.selectedRedeemReward();
    if (!reward) return;
    const result = this.rewardsService.redeemReward(reward.id);
    if (result.success) {
      this.toast.success('Redeemed!', `${result.name} redeemed for ${result.pointsUsed.toLocaleString()} pts.`);
    } else {
      this.toast.error('Failed', 'Unable to redeem. Check your points or limits.');
    }
    this.selectedRedeemReward.set(null);
  }

  onRedeemCancelled(): void {
    this.selectedRedeemReward.set(null);
  }

  onGiftConfirmed(recipientId: number): void {
    const reward = this.selectedGiftReward();
    if (!reward) return;
    const result = this.rewardsService.giftReward(recipientId, reward.id);
    if (result.success) {
      this.toast.success('Gift Sent!', `${result.rewardName} gifted to ${result.recipientName}.`);
    } else {
      this.toast.error('Failed', 'Unable to send gift. Check your points or eligibility.');
    }
    this.selectedGiftReward.set(null);
    this.giftSearchQuery.set('');
  }

  onGiftCancelled(): void {
    this.selectedGiftReward.set(null);
    this.giftSearchQuery.set('');
  }

  onGiftSearchQueryChanged(query: string): void {
    this.giftSearchQuery.set(query);
  }
}
