import { Component, inject, signal, computed } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../../../../core/services/mock-data.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { RewardsMapper } from '../models/rewards.models';
import { Donor, DonorTier, RewardDefinition, RedemptionStatus, RedemptionStatusLabel, RewardTypeLabel } from '../../../../../core/models/domain.models';
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
  readonly giftableCount = computed(() => this.catalogue().filter(r => r.isGiftable).length);

  // Transaction history
  readonly txnHistory = computed(() => this.svc.getRewardTransactionsForDonor(this.donor.id));

  // ── Redeem modal ────────────────────────────────────────────────────────────
  protected showRedeemModal = signal(false);
  protected selectedReward = signal<RewardDefinition | null>(null);

  // ── Gift modal ──────────────────────────────────────────────────────────────
  protected showGiftModal = signal(false);
  protected selectedGiftReward = signal<RewardDefinition | null>(null);
  protected giftStep = signal<'search' | 'confirm'>('search');
  protected giftSearchQuery = signal('');
  protected selectedRecipient = signal<Donor | null>(null);

  readonly giftSearchResults = computed(() => {
    const q = this.giftSearchQuery().toLowerCase().trim();
    if (q.length < 2) return [];
    return this.svc.donors
      .filter(d => d.id !== this.donor.id &&
        (`${d.firstName} ${d.lastName}`.toLowerCase().includes(q) || d.phone.includes(q)))
      .slice(0, 6);
  });

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

  canGift(def: RewardDefinition): boolean {
    return !!def.isGiftable && this.donor.loyaltyPoints >= def.pointsRequired;
  }

  // ── Redeem actions ──────────────────────────────────────────────────────────

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

  // ── Gift actions ────────────────────────────────────────────────────────────

  openGiftModal(def: RewardDefinition): void {
    this.selectedGiftReward.set(def);
    this.giftStep.set('search');
    this.giftSearchQuery.set('');
    this.selectedRecipient.set(null);
    this.showGiftModal.set(true);
  }

  selectRecipient(donor: Donor): void {
    this.selectedRecipient.set(donor);
    this.giftStep.set('confirm');
  }

  backToSearch(): void {
    this.giftStep.set('search');
    this.selectedRecipient.set(null);
  }

  confirmGift(): void {
    const def = this.selectedGiftReward();
    const recipient = this.selectedRecipient();
    if (!def || !recipient) return;
    const txn = this.svc.giftReward(this.donor.id, recipient.id, def.id);
    if (txn) {
      this.toast.success('Gift Sent!', `${def.name} gifted to ${recipient.firstName} ${recipient.lastName}.`);
    } else {
      this.toast.error('Failed', 'Unable to send gift. Check your points or eligibility.');
    }
    this.closeGiftModal();
  }

  closeGiftModal(): void {
    this.showGiftModal.set(false);
    this.selectedGiftReward.set(null);
    this.selectedRecipient.set(null);
    this.giftSearchQuery.set('');
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

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
