import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MockDataService } from '../../../../../core/services/mock-data.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { RewardsMapper, RewardItem, PointsEntry, CommunityGift } from '../models/rewards.models';
import { DonorTier } from '../../../../../core/models/domain.models';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-rewards',
  standalone: true,
  imports: [DecimalPipe, ModalComponent, IconComponent],
  templateUrl: './rewards.component.html',
  styleUrl: './rewards.component.scss'
})
export class RewardsComponent {
  protected svc = inject(MockDataService);
  protected toast = inject(ToastService);
  protected donor = this.svc.donors[0];
  protected tier = this.svc.getTier(this.donor.loyaltyTier);
  protected showRedeemModal = signal(false);
  protected selectedReward = signal<RewardItem | null>(null);

  get nextTier() {
    const idx = this.svc.loyaltyTiers.findIndex(t => t.tier === this.donor.loyaltyTier);
    return idx < this.svc.loyaltyTiers.length - 1 ? this.svc.loyaltyTiers[idx + 1] : null;
  }

  isAchieved(t: DonorTier): boolean {
    return RewardsMapper.isAchieved(this.donor.loyaltyTier, t);
  }

  readonly catalogue: RewardItem[] = [
    { icon: 'star', title: 'Store Discount Voucher', desc: '10% off next in-store purchase', cost: 200 },
    { icon: 'file-text', title: 'Impact Certificate', desc: 'Personalized digital certificate', cost: 50 },
    { icon: 'gift', title: 'VIP Shopping Day', desc: 'Early access to new arrivals', cost: 500 },
    { icon: 'trending-up', title: 'Community Recognition', desc: 'Featured on donor wall of fame', cost: 1000 },
    { icon: 'gift', title: 'Surprise Gift Box', desc: 'Curated items from our team', cost: 750 }
  ];

  readonly pointsLog: PointsEntry[] = [
    { icon: 'package', label: 'Donation — Downtown Store', date: 'Mar 1, 2026', delta: 53 },
    { icon: 'package', label: 'Donation — Downtown Store', date: 'Feb 15, 2026', delta: 28 },
    { icon: 'gift', label: 'Redeemed: VIP Shopping Day', date: 'Feb 1, 2026', delta: -500 },
    { icon: 'package', label: 'Donation — Northside Store', date: 'Jan 22, 2026', delta: 116 },
    { icon: 'star', label: 'Gold Tier Bonus', date: 'Jan 1, 2026', delta: 200 }
  ];

  readonly causes: CommunityGift[] = [
    { icon: 'building', name: 'Local Schools Fund', desc: 'Support community education programs' },
    { icon: 'home', name: 'Food Bank Alliance', desc: 'Fight hunger in our neighborhood' },
    { icon: 'refresh', name: 'Green Planet Initiative', desc: 'Environmental sustainability programs' }
  ];

  openRedeemModal(r: RewardItem): void {
    this.selectedReward.set(r);
    this.showRedeemModal.set(true);
  }

  confirmRedeem(): void {
    const r = this.selectedReward();
    if (!r) return;
    this.showRedeemModal.set(false);
    this.toast.success('Redeemed!', `${r.title} redeemed for ${r.cost.toLocaleString()} points.`);
    // Update donor points (in real app, this would be an API call)
    this.donor.loyaltyPoints -= r.cost;
  }

  closeRedeemModal(): void {
    this.showRedeemModal.set(false);
    this.selectedReward.set(null);
  }
}
