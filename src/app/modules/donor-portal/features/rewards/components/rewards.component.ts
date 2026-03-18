import { Component, inject, signal, computed } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../../../../core/services/mock-data.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { RewardsMapper } from '../models/rewards.models';
import { DonorTier, RewardDefinition, RewardTransaction, RewardStatus } from '../../../../../core/models/domain.models';
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
  protected readonly RS = RewardStatus;

  // Redeem modal
  protected showRedeemModal = signal(false);
  protected selectedDef = signal<RewardDefinition | null>(null);

  // Gift modal
  protected showGiftModal = signal(false);
  protected giftingTxn = signal<RewardTransaction | null>(null);
  protected giftName = signal('');
  protected giftContact = signal('');

  // Active reward definitions from service
  readonly catalogue = computed(() =>
    this.svc.rewardDefinitions().filter(r => r.active).sort((a, b) => a.sortOrder - b.sortOrder)
  );

  // Real transaction history for this donor
  readonly txnHistory = computed(() =>
    this.svc.getRewardTransactionsForDonor(this.donor.id)
  );

  // Redeemed (but not yet gifted) transactions
  readonly redeemableTxns = computed(() =>
    this.txnHistory().filter(t => t.status === RewardStatus.Redeemed)
  );

  get nextTier() {
    const idx = this.svc.loyaltyTiers.findIndex(t => t.tier === this.donor.loyaltyTier);
    return idx < this.svc.loyaltyTiers.length - 1 ? this.svc.loyaltyTiers[idx + 1] : null;
  }

  isAchieved(t: DonorTier): boolean {
    return RewardsMapper.isAchieved(this.donor.loyaltyTier, t);
  }

  openRedeemModal(def: RewardDefinition): void {
    this.selectedDef.set(def);
    this.showRedeemModal.set(true);
  }

  confirmRedeem(): void {
    const def = this.selectedDef();
    if (!def) return;
    const txn = this.svc.redeemReward(this.donor.id, def.id);
    if (txn) {
      this.toast.success('Redeemed!', `${def.name} redeemed for ${def.pointsRequired.toLocaleString()} pts.`);
    } else {
      this.toast.error('Failed', 'Not enough points or reward unavailable.');
    }
    this.showRedeemModal.set(false);
    this.selectedDef.set(null);
  }

  closeRedeemModal(): void {
    this.showRedeemModal.set(false);
    this.selectedDef.set(null);
  }

  openGiftModal(txn: RewardTransaction): void {
    this.giftingTxn.set(txn);
    this.giftName.set('');
    this.giftContact.set('');
    this.showGiftModal.set(true);
  }

  confirmGift(): void {
    const txn = this.giftingTxn();
    if (!txn || !this.giftName().trim() || !this.giftContact().trim()) return;
    const ok = this.svc.giftReward(txn.id, this.giftName().trim(), this.giftContact().trim());
    if (ok) {
      this.toast.success('Gifted!', `Reward gifted to ${this.giftName()}.`);
    } else {
      this.toast.error('Failed', 'Could not gift this reward.');
    }
    this.showGiftModal.set(false);
    this.giftingTxn.set(null);
  }

  closeGiftModal(): void {
    this.showGiftModal.set(false);
    this.giftingTxn.set(null);
  }

  txnStatusBadge(s: RewardStatus): string {
    const m: Record<RewardStatus, string> = {
      [RewardStatus.Active]:   'badge-info',
      [RewardStatus.Redeemed]: 'badge-success',
      [RewardStatus.Gifted]:   'badge-purple',
      [RewardStatus.Expired]:  'badge-gray',
    };
    return m[s] ?? 'badge-gray';
  }

  txnStatusLabel(s: RewardStatus): string {
    const m: Record<RewardStatus, string> = {
      [RewardStatus.Active]:   'Active',
      [RewardStatus.Redeemed]: 'Redeemed',
      [RewardStatus.Gifted]:   'Gifted',
      [RewardStatus.Expired]:  'Expired',
    };
    return m[s] ?? String(s);
  }
}
