import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { ToastService } from '@core/services/toast.service';
import { RewardType } from '@core/models/domain.models';
import { SettingsService } from '../services/settings.service';
import { SettingsTab, RewardFilterStatus, RewardModalMode } from '../models/settings.enum';
import {
  SystemRulesState,
  LoyaltyTierState,
  RewardDefinitionState,
  RewardTransactionState,
  RewardFormState,
  RewardTypeOption
} from '../models/settings.state';
import { emptyRewardForm, mapRewardToFormState } from '../models/settings.mapper';
import { SettingsTabBarComponent } from '../components/settings-tab-bar/settings-tab-bar.component';
import { GeneralSettingsFormComponent } from '../components/general-settings-form/general-settings-form.component';
import {
  LoyaltyTierEditorComponent,
  TierMultiplierChange
} from '../components/loyalty-tier-editor/loyalty-tier-editor.component';
import { RewardsManagementComponent } from '../components/rewards-management/rewards-management.component';
import { RewardFormModalComponent } from '../components/reward-form-modal/reward-form-modal.component';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    SettingsTabBarComponent,
    GeneralSettingsFormComponent,
    LoyaltyTierEditorComponent,
    RewardsManagementComponent,
    RewardFormModalComponent
  ],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsPageComponent {
  private readonly settingsService = inject(SettingsService);
  private readonly toast = inject(ToastService);

  // ── Tab state ──────────────────────────────────────────────────────────────
  protected readonly activeTab = signal<SettingsTab>('general');

  // ── General tab ────────────────────────────────────────────────────────────
  protected readonly systemRules = computed<SystemRulesState>(() => this.settingsService.getAppConfig());

  // ── Loyalty tab ────────────────────────────────────────────────────────────
  protected readonly loyaltyTiers = computed<LoyaltyTierState[]>(() => this.settingsService.getLoyaltyTiers());

  // ── Rewards tab ────────────────────────────────────────────────────────────
  protected readonly rewardFilter = signal<RewardFilterStatus>('all');
  protected readonly typeFilter = signal<RewardType | 0>(0);
  protected readonly modalMode = signal<RewardModalMode>(null);
  protected readonly rewardForm = signal<RewardFormState>(emptyRewardForm());
  private editingRewardId: number | null = null;

  protected readonly rewardTypes: RewardTypeOption[] = [
    { value: RewardType.Discount, label: 'Discount' },
    { value: RewardType.Cashback, label: 'Cashback' },
    { value: RewardType.Gift, label: 'Gift' },
    { value: RewardType.Voucher, label: 'Voucher' }
  ];

  protected readonly filteredRewards = computed<RewardDefinitionState[]>(() =>
    this.settingsService.getRewardDefinitions(this.rewardFilter(), this.typeFilter())
  );

  protected readonly transactions = computed<RewardTransactionState[]>(() =>
    this.settingsService.getRewardTransactions()
  );

  // ── General tab actions ────────────────────────────────────────────────────
  protected onSaveSystemRules(rules: SystemRulesState): void {
    this.settingsService.updateAppConfig(rules);
    this.toast.success('Saved!', 'System rules updated.');
  }

  // ── Loyalty tab actions ────────────────────────────────────────────────────
  protected onSaveTiers(changes: TierMultiplierChange[]): void {
    for (const change of changes) {
      this.settingsService.updateTierMultiplier(change.tier, change.pointsMultiplier);
    }
    this.toast.success('Saved!', 'Loyalty configuration updated.');
  }

  // ── Rewards tab actions ────────────────────────────────────────────────────
  protected onAddReward(): void {
    this.rewardForm.set(emptyRewardForm());
    this.editingRewardId = null;
    this.modalMode.set('add-reward');
  }

  protected onEditReward(reward: RewardDefinitionState): void {
    this.editingRewardId = reward.id;
    this.rewardForm.set(mapRewardToFormState(reward));
    this.modalMode.set('edit-reward');
  }

  protected onToggleActive(reward: RewardDefinitionState): void {
    this.settingsService.toggleRewardActive(reward.id, reward.isActive);
    this.toast.success(
      reward.isActive ? 'Deactivated' : 'Activated',
      `${reward.name} ${reward.isActive ? 'deactivated' : 'activated'}.`
    );
  }

  protected onDeleteReward(reward: RewardDefinitionState): void {
    this.settingsService.deleteReward(reward.id);
    this.toast.success('Deleted', `${reward.name} removed.`);
  }

  protected onModalClosed(): void {
    this.modalMode.set(null);
  }

  protected onModalConfirmed(form: RewardFormState): void {
    if (this.modalMode() === 'add-reward') {
      const name = this.settingsService.createReward(form);
      this.toast.success('Created!', `Reward "${name}" added.`);
    } else if (this.editingRewardId != null) {
      this.settingsService.updateReward(this.editingRewardId, form);
      this.toast.success('Updated!', `Reward "${form.name}" updated.`);
    }
    this.modalMode.set(null);
  }

  // ── Redemption actions ─────────────────────────────────────────────────────
  protected onApproveRedemption(txnId: number): void {
    if (this.settingsService.approveRedemption(txnId)) {
      this.toast.success('Approved', 'Redemption approved.');
    }
  }

  protected onRejectRedemption(txnId: number): void {
    if (this.settingsService.rejectRedemption(txnId)) {
      this.toast.success('Rejected', 'Redemption rejected. Points refunded.');
    }
  }

  protected onFulfillRedemption(txnId: number): void {
    if (this.settingsService.fulfillRedemption(txnId)) {
      this.toast.success('Fulfilled', 'Reward fulfilled.');
    }
  }

  protected onCancelRedemption(txnId: number): void {
    if (this.settingsService.cancelRedemption(txnId)) {
      this.toast.success('Cancelled', 'Redemption cancelled. Points refunded.');
    }
  }
}
