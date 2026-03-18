import { Component, inject, signal, computed } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../../../../core/services/mock-data.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { RewardsMapper } from '../models/rewards.models';
import { DonorTier, RewardDefinition, RedemptionStatus, RedemptionStatusLabel, RewardTypeLabel } from '../../../../../core/models/domain.models';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-rewards',
  standalone: true,
  imports: [DecimalPipe, DatePipe, FormsModule, ModalComponent, IconComponent],
  templateUrl: './rewards.component.html',
  styleUrl: './rewards.component.scss'
})
export class RewardsComponent {
  protected svc = inject(MockDataService);
  protected toast = inject(ToastService);
  protected donor = this.svc.donors[0];
  protected tier = this.svc.getTier(this.donor.loyaltyTier);
  protected RS = RedemptionStatus;
  protected RTL = RewardTypeLabel;

  // Available rewards catalogue
  readonly catalogue = computed(() => this.svc.getAvailableRewardsForDonor(this.donor.id));

  // Transaction history
  readonly txnHistory = computed(() => this.svc.getRewardTransactionsForDonor(this.donor.id));

  // Redeem modal
  protected showRedeemModal = signal(false);
  protected selectedReward = signal<RewardDefinition | null>(null);

  get nextTier() {
    const idx = this.svc.loyaltyTiers.findIndex(t => t.tier === this.donor.loyaltyTier);
    return idx < this.svc.loyaltyTiers.length - 1 ? this.svc.loyaltyTiers[idx + 1] : null;
  }

  isAchieved(t: DonorTier): boolean {
    return RewardsMapper.isAchieved(this.donor.loyaltyTier, t);
  }

  canRedeem(def: RewardDefinition): boolean {
    return this.donor.loyaltyPoints >= def.pointsRequired;
  }

  openRedeemModal(def: RewardDefinition): void {
    this.selectedReward.set(def);
    this.showRedeemModal.set(true);
  }

  confirmRedeem(): void {
    const def = this.selectedReward();
    if (!def) return;
    const txn = this.svc.redeemReward(this.donor.id, def.id);
    if (txn) {
      this.toast.success('Redeemed!', `${def.name} redeemed for ${txn.pointsUsed.toLocaleString()} pts.`);
    } else {
      this.toast.error('Failed', 'Unable to redeem. Check your points or limits.');
    }
    this.showRedeemModal.set(false);
    this.selectedReward.set(null);
  }

  closeRedeemModal(): void {
    this.showRedeemModal.set(false);
    this.selectedReward.set(null);
  }

  txnStatusBadge(s: RedemptionStatus): string {
    const m: Record<RedemptionStatus, string> = {
      [RedemptionStatus.Pending]:   'badge-warning',
      [RedemptionStatus.Approved]:  'badge-info',
      [RedemptionStatus.Rejected]:  'badge-danger',
      [RedemptionStatus.Fulfilled]: 'badge-success',
      [RedemptionStatus.Cancelled]: 'badge-gray',
    };
    return m[s] ?? 'badge-gray';
  }

  txnStatusLabel(s: RedemptionStatus): string {
    return RedemptionStatusLabel[s] ?? String(s);
  }
}
