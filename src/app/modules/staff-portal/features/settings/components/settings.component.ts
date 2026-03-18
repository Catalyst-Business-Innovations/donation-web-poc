import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../../../core/services/toast.service';
import { MockDataService } from '../../../../../core/services/mock-data.service';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { SystemRulesSettings } from '../models/settings.models';
import { DonationCategory, RewardDefinition } from '../../../../../core/models/domain.models';

type ModalMode = 'add-category' | 'edit-category' | 'add-reward' | 'edit-reward' | null;

interface CategoryForm {
  key: string;
  name: string;
  icon: string;
  estimatedValue: number;
}

interface RewardForm {
  name: string;
  description: string;
  pointsRequired: number;
  discountValue: number;
  icon: string;
  active: boolean;
  sortOrder: number;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, ModalComponent, IconComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  protected svc = inject(MockDataService);
  protected toast = inject(ToastService);

  protected activeTab = signal<'general' | 'loyalty'>('general');
  protected modalMode = signal<ModalMode>(null);
  protected selectedCategory = signal<DonationCategory | null>(null);

  protected selectedReward = signal<RewardDefinition | null>(null);
  protected categoryForm: CategoryForm = { key: '', name: '', icon: '', estimatedValue: 0 };
  protected rewardForm: RewardForm = { name: '', description: '', pointsRequired: 0, discountValue: 0, icon: '🏷️', active: true, sortOrder: 0 };

  // Phase 2 — System Rules (Req 2, 3, 4)
  readonly cfg = this.svc.appConfig;

  systemRules: SystemRulesSettings = {
    isCashAccepted:     this.svc.appConfig().isCashAccepted,
    associationWindowHours: this.svc.appConfig().associationWindowHours,
    pointsPerItem:      this.svc.appConfig().pointsPerItem,
    emailForReceipt:    this.svc.appConfig().emailReqs.forReceipt,
    emailForLogin:      this.svc.appConfig().emailReqs.forLogin,
    emailForCampaigns:  this.svc.appConfig().emailReqs.forCampaigns,
  };

  tierCopies = this.svc.loyaltyTiers.map(t => ({ ...t }));

  save(section: string): void {
    this.toast.success('Saved!', `${section} updated.`);
  }

  saveSystemRules(): void {
    this.svc.updateAppConfig({
      isCashAccepted:         this.systemRules.isCashAccepted,
      associationWindowHours: this.systemRules.associationWindowHours,
      pointsPerItem:          this.systemRules.pointsPerItem,
      emailReqs: {
        forReceipt:   this.systemRules.emailForReceipt,
        forLogin:     this.systemRules.emailForLogin,
        forCampaigns: this.systemRules.emailForCampaigns,
      },
    });
    this.toast.success('Saved!', 'System rules updated.');
  }

  // Reward definition modal actions
  openAddRewardModal(): void {
    this.rewardForm = { name: '', description: 'Redeemable at POS', pointsRequired: 100, discountValue: 5, icon: '🏷️', active: true, sortOrder: this.svc.rewardDefinitions().length + 1 };
    this.modalMode.set('add-reward');
  }

  openEditRewardModal(reward: RewardDefinition): void {
    this.rewardForm = { name: reward.name, description: reward.description, pointsRequired: reward.pointsRequired, discountValue: reward.discountValue, icon: reward.icon, active: reward.active, sortOrder: reward.sortOrder };
    this.selectedReward.set(reward);
    this.modalMode.set('edit-reward');
  }

  saveRewardForm(): void {
    const { name, pointsRequired } = this.rewardForm;
    if (!name || pointsRequired <= 0) {
      this.toast.warning('Missing Info', 'Name and points required are needed.');
      return;
    }
    const mode = this.modalMode();
    if (mode === 'add-reward') {
      this.svc.addRewardDefinition(this.rewardForm);
      this.toast.success('Added!', `Reward "${name}" created.`);
    } else if (mode === 'edit-reward') {
      const r = this.selectedReward();
      if (r) { this.svc.updateRewardDefinition(r.id, this.rewardForm); }
      this.toast.success('Saved!', `Reward "${name}" updated.`);
    }
    this.closeModal();
  }

  deleteReward(id: number): void {
    this.svc.removeRewardDefinition(id);
    this.toast.info('Removed', 'Reward definition deleted.');
  }

  // Category modal actions
  openAddCategoryModal(): void {
    this.categoryForm = { key: '', name: '', icon: '📦', estimatedValue: 10 };
    this.modalMode.set('add-category');
  }

  openEditCategoryModal(cat: DonationCategory): void {
    this.categoryForm = {
      key: cat.key,
      name: cat.name,
      icon: cat.icon,
      estimatedValue: cat.estimatedValue
    };
    this.selectedCategory.set(cat);
    this.modalMode.set('edit-category');
  }

  saveCategoryForm(): void {
    const { name, icon, estimatedValue } = this.categoryForm;
    if (!name || !icon) {
      this.toast.warning('Missing Info', 'Category name and icon are required.');
      return;
    }

    const mode = this.modalMode();
    if (mode === 'add-category') {
      this.toast.success('Success!', `Category "${name}" has been added.`);
    } else if (mode === 'edit-category') {
      this.toast.success('Saved!', `Category "${name}" has been updated.`);
    }
    this.closeModal();
  }

  closeModal(): void {
    this.modalMode.set(null);
    this.selectedCategory.set(null);
    this.selectedReward.set(null);
  }

  get modalTitle(): string {
    const mode = this.modalMode();
    if (mode === 'add-category') return '➕ Add Category';
    if (mode === 'edit-category') return '✏️ Edit Category';
    if (mode === 'add-reward') return '➕ Add Reward Tier';
    if (mode === 'edit-reward') return '✏️ Edit Reward Tier';
    return '';
  }

  get confirmLabel(): string {
    const mode = this.modalMode();
    if (mode === 'add-category') return 'Add Category';
    if (mode === 'edit-category') return 'Save Changes';
    if (mode === 'add-reward') return 'Add Reward';
    if (mode === 'edit-reward') return 'Save Changes';
    return 'Close';
  }
}
