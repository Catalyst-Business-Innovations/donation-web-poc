import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { ToastService } from '../../../../../core/services/toast.service';
import { MockDataService } from '../../../../../core/services/mock-data.service';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { SystemRulesSettings } from '../models/settings.models';
import { RewardDefinition, RewardType, RewardTypeLabel, RedemptionStatus, RedemptionStatusLabel } from '../../../../../core/models/domain.models';

type ModalMode = 'add-reward' | 'edit-reward' | null;

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, DecimalPipe, DatePipe, IconComponent, ModalComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  protected svc = inject(MockDataService);
  protected toast = inject(ToastService);

  protected activeTab = signal<'general' | 'loyalty' | 'rewards'>('general');
  protected modalMode = signal<ModalMode>(null);

  protected RTL = RewardTypeLabel;
  protected RSL = RedemptionStatusLabel;
  protected RewardType = RewardType;
  protected RS = RedemptionStatus;

  // Reward types for dropdown
  protected rewardTypes = [
    { value: RewardType.Discount, label: 'Discount' },
    { value: RewardType.Cashback, label: 'Cashback' },
    { value: RewardType.Gift, label: 'Gift' },
    { value: RewardType.Voucher, label: 'Voucher' },
  ];

  // Reward form
  protected editingRewardId: number | null = null;
  protected rewardForm = this.emptyRewardForm();

  private emptyRewardForm() {
    return {
      name: '',
      description: '',
      pointsRequired: 100,
      rewardType: RewardType.Discount,
      value: 5,
      isActive: true,
      isGiftable: false,
      maxRedemptionsPerUser: null as number | null,
      totalRedemptionLimit: null as number | null,
    };
  }

  // System Rules
  readonly cfg = this.svc.appConfig;

  systemRules: SystemRulesSettings = {
    isCashAccepted:     this.svc.appConfig().isCashAccepted,
    associationWindowHours: this.svc.appConfig().associationWindowHours,
    pointsPerItem:      this.svc.appConfig().pointsPerItem,
    pointsPerDollar:    this.svc.appConfig().pointsPerDollar,
    requireApproval:    this.svc.appConfig().requireApproval,
    emailForReceipt:    this.svc.appConfig().emailReqs.forReceipt,
    emailForLogin:      this.svc.appConfig().emailReqs.forLogin,
    emailForCampaigns:  this.svc.appConfig().emailReqs.forCampaigns,
  };

  tierCopies = this.svc.loyaltyTiers.map(t => ({ ...t }));

  // Reward filter
  protected rewardFilter = signal<'all' | 'active' | 'inactive'>('all');
  protected typeFilter = signal<RewardType | 0>(0);

  readonly filteredRewards = computed(() => {
    let list = this.svc.rewardDefinitions();
    const f = this.rewardFilter();
    if (f === 'active') list = list.filter(r => r.isActive);
    else if (f === 'inactive') list = list.filter(r => !r.isActive);
    const tf = this.typeFilter();
    if (tf) list = list.filter(r => r.rewardType === tf);
    return list;
  });

  // Redemption history (all)
  readonly allTransactions = computed(() => this.svc.rewardTransactions());

  save(section: string): void {
    this.toast.success('Saved!', `${section} updated.`);
  }

  saveSystemRules(): void {
    this.svc.updateAppConfig({
      isCashAccepted:         this.systemRules.isCashAccepted,
      associationWindowHours: this.systemRules.associationWindowHours,
      pointsPerItem:          this.systemRules.pointsPerItem,
      pointsPerDollar:        this.systemRules.pointsPerDollar,
      requireApproval:        this.systemRules.requireApproval,
      emailReqs: {
        forReceipt:   this.systemRules.emailForReceipt,
        forLogin:     this.systemRules.emailForLogin,
        forCampaigns: this.systemRules.emailForCampaigns,
      },
    });
    this.toast.success('Saved!', 'System rules updated.');
  }

  // ── Reward CRUD ───────────────────────────────────────────────

  openAddReward(): void {
    this.rewardForm = this.emptyRewardForm();
    this.editingRewardId = null;
    this.modalMode.set('add-reward');
  }

  openEditReward(r: RewardDefinition): void {
    this.editingRewardId = r.id;
    this.rewardForm = {
      name: r.name,
      description: r.description,
      pointsRequired: r.pointsRequired,
      rewardType: r.rewardType,
      value: r.value,
      isActive: r.isActive,
      isGiftable: r.isGiftable ?? false,
      maxRedemptionsPerUser: r.maxRedemptionsPerUser ?? null,
      totalRedemptionLimit: r.totalRedemptionLimit ?? null,
    };
    this.modalMode.set('edit-reward');
  }

  confirmRewardModal(): void {
    const f = this.rewardForm;
    if (!f.name.trim()) return;
    if (this.modalMode() === 'add-reward') {
      this.svc.addRewardDefinition({
        name: f.name.trim(),
        description: f.description,
        pointsRequired: f.pointsRequired,
        rewardType: f.rewardType,
        value: f.value,
        isActive: f.isActive,
        isGiftable: f.isGiftable,
        maxRedemptionsPerUser: f.maxRedemptionsPerUser ?? undefined,
        totalRedemptionLimit: f.totalRedemptionLimit ?? undefined,
      });
      this.toast.success('Created!', `Reward "${f.name}" added.`);
    } else if (this.editingRewardId != null) {
      this.svc.updateRewardDefinition(this.editingRewardId, {
        name: f.name.trim(),
        description: f.description,
        pointsRequired: f.pointsRequired,
        rewardType: f.rewardType,
        value: f.value,
        isActive: f.isActive,
        isGiftable: f.isGiftable,
        maxRedemptionsPerUser: f.maxRedemptionsPerUser ?? undefined,
        totalRedemptionLimit: f.totalRedemptionLimit ?? undefined,
      });
      this.toast.success('Updated!', `Reward "${f.name}" updated.`);
    }
    this.modalMode.set(null);
  }

  toggleRewardActive(r: RewardDefinition): void {
    this.svc.updateRewardDefinition(r.id, { isActive: !r.isActive });
    this.toast.success(r.isActive ? 'Deactivated' : 'Activated', `${r.name} ${r.isActive ? 'deactivated' : 'activated'}.`);
  }

  deleteReward(r: RewardDefinition): void {
    this.svc.removeRewardDefinition(r.id);
    this.toast.success('Deleted', `${r.name} removed.`);
  }

  // ── Redemption management ─────────────────────────────────────

  approveRedemption(txnId: number): void {
    if (this.svc.approveRedemption(txnId)) this.toast.success('Approved', 'Redemption approved.');
  }

  rejectRedemption(txnId: number): void {
    if (this.svc.rejectRedemption(txnId, 'Rejected by admin')) this.toast.success('Rejected', 'Redemption rejected. Points refunded.');
  }

  fulfillRedemption(txnId: number): void {
    if (this.svc.fulfillRedemption(txnId)) this.toast.success('Fulfilled', 'Reward fulfilled.');
  }

  cancelRedemption(txnId: number): void {
    if (this.svc.cancelRedemption(txnId)) this.toast.success('Cancelled', 'Redemption cancelled. Points refunded.');
  }

  get modalTitle(): string {
    return this.modalMode() === 'add-reward' ? 'Add Reward' : 'Edit Reward';
  }

  get modalConfirmLabel(): string {
    return this.modalMode() === 'add-reward' ? 'Create Reward' : 'Save Changes';
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
}
