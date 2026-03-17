import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../../../core/services/toast.service';
import { MockDataService } from '../../../../../core/services/mock-data.service';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { NotifSetting, Integration, OrgSettings } from '../models/settings.models';
import { DonationCategory } from '../../../../../core/models/domain.models';

type ModalMode = 'add-category' | 'edit-category' | 'configure-integration' | null;

interface CategoryForm {
  key: string;
  name: string;
  icon: string;
  estimatedValue: number;
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

  protected modalMode = signal<ModalMode>(null);
  protected selectedCategory = signal<DonationCategory | null>(null);
  protected selectedIntegration = signal<Integration | null>(null);
  protected categoryForm: CategoryForm = { key: '', name: '', icon: '', estimatedValue: 0 };

  tierCopies = this.svc.loyaltyTiers.map(t => ({ ...t }));

  org: OrgSettings = {
    orgName: 'Brijjworks Thrift Stores',
    taxId: '12-3456789',
    receiptMessage: 'Thank you for your generous donation! Your contribution helps our community thrive.',
    irsDisclaimer: 'No goods or services were provided in exchange. Estimated values are guidance only.'
  };

  notifications: NotifSetting[] = [
    { key: 'sync', label: 'TPM/IMS Sync Failures', desc: 'Alert when integration sync fails', enabled: true },
    { key: 'new', label: 'New Donor Enrollments', desc: 'Daily summary of new registrations', enabled: false },
    { key: 'yr', label: 'Year-End Summary Reminders', desc: 'Remind donors to download tax summaries', enabled: true },
    { key: 'age', label: 'Aged Container Alerts', desc: 'Flag containers in limbo > 48 hours', enabled: true }
  ];

  integrations: Integration[] = [
    { icon: 'grid', name: 'Brijjworks POS', desc: 'Donor/customer shopping behavior matching', connected: true },
    { icon: 'layers', name: 'TPM (Production)', desc: 'Presort data and container routing', connected: true },
    { icon: 'building', name: 'IMS (Inventory)', desc: 'Container location and warehouse tracking', connected: true },
    { icon: 'credit-card', name: 'Brijjworks Payments', desc: 'PCI DSS compliant payment processing', connected: true },
    { icon: 'send', name: 'Marketing Automation', desc: 'Campaign triggers and donor segmentation', connected: false },
    { icon: 'eye', name: 'Solink Camera', desc: 'Vehicle counting at donation doors (Phase 2)', connected: false }
  ];

  save(section: string): void {
    this.toast.success('Saved!', `${section} updated.`);
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

  // Integration modal actions
  openConfigureIntegrationModal(int: Integration): void {
    this.selectedIntegration.set(int);
    this.modalMode.set('configure-integration');
  }

  toggleIntegrationConnection(): void {
    const int = this.selectedIntegration();
    if (int) {
      const newStatus = !int.connected;
      this.toast.success(
        newStatus ? 'Connected!' : 'Disconnected',
        `${int.name} is now ${newStatus ? 'connected' : 'disconnected'}.`
      );
      int.connected = newStatus;
    }
    this.closeModal();
  }

  closeModal(): void {
    this.modalMode.set(null);
    this.selectedCategory.set(null);
    this.selectedIntegration.set(null);
  }

  get modalTitle(): string {
    const mode = this.modalMode();
    if (mode === 'add-category') return '➕ Add Category';
    if (mode === 'edit-category') return '✏️ Edit Category';
    if (mode === 'configure-integration') return `Configure: ${this.selectedIntegration()?.name ?? 'Integration'}`;
    return '';
  }

  get confirmLabel(): string {
    const mode = this.modalMode();
    if (mode === 'add-category') return 'Add Category';
    if (mode === 'edit-category') return 'Save Changes';
    if (mode === 'configure-integration') {
      const int = this.selectedIntegration();
      return int?.connected ? 'Disconnect' : 'Connect';
    }
    return 'Close';
  }
}
