import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MockDataService } from '../../../../../core/services/mock-data.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import {
  Campaign, CampaignStatus, CampaignStatusLabel,
  CampaignTargetCriteria,
  NotificationChannel, NotificationChannelLabel
} from '../../../../../core/models/domain.models';

interface CampaignForm {
  name: string;
  description: string;
  effectiveFrom: string;
  toDate: string;
  channel: NotificationChannel;
  criteria: CampaignTargetCriteria[];
}

/** Transient state for the in-progress criterion being built */
interface CriterionDraft {
  departmentKey: string;
  categoryKey: string;
  subCategoryKey: string;
}

type ModalMode = 'add' | 'edit' | 'execute' | null;

@Component({
  selector: 'app-campaigns',
  standalone: true,
  imports: [FormsModule, DatePipe, ModalComponent, IconComponent],
  templateUrl: './campaigns.component.html',
  styleUrl: './campaigns.component.scss'
})
export class CampaignsComponent {
  protected svc = inject(MockDataService);
  protected toast = inject(ToastService);

  protected readonly CS = CampaignStatus;
  protected readonly NC = NotificationChannel;
  protected readonly NCLabel = NotificationChannelLabel;

  protected statusFilter = signal<CampaignStatus | ''>('');
  protected query = signal('');

  protected modalMode = signal<ModalMode>(null);
  protected selectedCampaign = signal<Campaign | null>(null);
  protected executeResults = signal<{ sent: number; failed: number } | null>(null);

  protected form: CampaignForm = this.emptyForm();
  protected criterionDraft: CriterionDraft = this.emptyCriterionDraft();

  // ── Cascading dept/cat/subcat lists for the criterion builder ──
  get draftCategories() {
    if (!this.criterionDraft.departmentKey) return [];
    return this.svc.departments.find(d => d.key === this.criterionDraft.departmentKey)?.categories ?? [];
  }
  get draftSubCategories() {
    return this.draftCategories.find(c => c.key === this.criterionDraft.categoryKey)?.subCategories ?? [];
  }

  get canSaveCampaign(): boolean {
    const f = this.form;
    if (!f.name.trim()) return false;
    if (f.effectiveFrom && f.toDate && f.toDate < f.effectiveFrom) return false;
    return true;
  }

  readonly filtered = computed(() => {
    const q = this.query().toLowerCase();
    const sf = this.statusFilter();
    return this.svc.campaigns().filter(c => {
      const mQ = !q || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
      const mS = !sf || c.status === sf;
      return mQ && mS;
    });
  });

  readonly counts = computed(() => {
    const all = this.svc.campaigns();
    return {
      draft:     all.filter(c => c.status === CampaignStatus.Draft).length,
      active:    all.filter(c => c.status === CampaignStatus.Active).length,
      paused:    all.filter(c => c.status === CampaignStatus.Paused).length,
      completed: all.filter(c => c.status === CampaignStatus.Completed).length,
    };
  });

  statusBadge(s: CampaignStatus): string {
    const m: Record<CampaignStatus, string> = {
      [CampaignStatus.Draft]:     'badge-gray',
      [CampaignStatus.Active]:    'badge-success',
      [CampaignStatus.Paused]:    'badge-warning',
      [CampaignStatus.Completed]: 'badge-info',
    };
    return m[s] ?? 'badge-gray';
  }

  statusLabel(s: CampaignStatus): string {
    return CampaignStatusLabel[s] ?? String(s);
  }

  channelLabel(c: NotificationChannel): string {
    return NotificationChannelLabel[c] ?? String(c);
  }

  openAdd(): void {
    this.form = this.emptyForm();
    this.criterionDraft = this.emptyCriterionDraft();
    this.selectedCampaign.set(null);
    this.modalMode.set('add');
  }

  openEdit(c: Campaign, event: Event): void {
    event.stopPropagation();
    this.selectedCampaign.set(c);
    this.form = {
      name:          c.name,
      description:   c.description,
      effectiveFrom: c.startDate ? c.startDate.toISOString().split('T')[0] : '',
      toDate:        c.endDate   ? c.endDate.toISOString().split('T')[0]   : '',
      channel:       c.channel,
      criteria:      [...(c.targetCriteria ?? [])],
    };
    this.criterionDraft = this.emptyCriterionDraft();
    this.modalMode.set('edit');
  }

  openExecute(c: Campaign, event: Event): void {
    event.stopPropagation();
    this.selectedCampaign.set(c);
    this.executeResults.set(null);
    this.modalMode.set('execute');
  }

  closeModal(): void {
    this.modalMode.set(null);
    this.selectedCampaign.set(null);
    this.executeResults.set(null);
  }

  addCriterion(): void {
    const d = this.criterionDraft;
    if (!d.departmentKey) return;
    const dept = this.svc.departments.find(dep => dep.key === d.departmentKey);
    const cat  = this.draftCategories.find(c => c.key === d.categoryKey);
    const sub  = this.draftSubCategories.find(s => s.key === d.subCategoryKey);
    const criterion: CampaignTargetCriteria = {
      departmentKey:   dept?.key,
      departmentName:  dept?.name,
      categoryKey:     cat?.key,
      categoryName:    cat?.name,
      subCategoryKey:  sub?.key,
      subCategoryName: sub?.name,
    };
    this.form.criteria = [...this.form.criteria, criterion];
    this.criterionDraft = this.emptyCriterionDraft();
  }

  removeCriterion(index: number): void {
    this.form.criteria = this.form.criteria.filter((_, i) => i !== index);
  }

  criterionLabel(c: CampaignTargetCriteria): string {
    return [c.departmentName, c.categoryName, c.subCategoryName].filter(Boolean).join(' › ');
  }

  saveCampaign(): void {
    if (!this.canSaveCampaign) {
      this.toast.warning('Incomplete', 'Campaign name is required. If dates are set, the To Date must be on or after Effective From.');
      return;
    }
    const mode = this.modalMode();
    const payload = {
      name:        this.form.name.trim(),
      description: this.form.description.trim(),
      startDate:   this.form.effectiveFrom ? new Date(this.form.effectiveFrom) : new Date(),
      endDate:     this.form.toDate        ? new Date(this.form.toDate)        : new Date('2099-12-31'),
      channel:     this.form.channel,
      status:      mode === 'add' ? CampaignStatus.Draft : this.selectedCampaign()!.status,
      targetCriteria: this.form.criteria,
      notificationHistory: mode === 'edit' ? this.selectedCampaign()!.notificationHistory : [],
      createdByStaffId: this.svc.session.staffId,
    };

    if (mode === 'add') {
      this.svc.createCampaign(payload);
      this.toast.success('Created', `Campaign "${payload.name}" created as Draft.`);
    } else {
      this.svc.updateCampaign(this.selectedCampaign()!.id, payload);
      this.toast.success('Saved', `Campaign "${payload.name}" updated.`);
    }
    this.closeModal();
  }

  activateCampaign(c: Campaign, event: Event): void {
    event.stopPropagation();
    this.svc.updateCampaign(c.id, { status: CampaignStatus.Active });
    this.toast.success('Activated', `"${c.name}" is now Active.`);
  }

  pauseCampaign(c: Campaign, event: Event): void {
    event.stopPropagation();
    this.svc.updateCampaign(c.id, { status: CampaignStatus.Paused });
    this.toast.info('Paused', `"${c.name}" has been paused.`);
  }

  runCampaign(): void {
    const c = this.selectedCampaign();
    if (!c) return;
    const notifications = this.svc.executeCampaign(c.id);
    const sent   = notifications.filter(n => n.success).length;
    const failed = notifications.filter(n => !n.success).length;
    this.executeResults.set({ sent, failed });
    if (sent > 0) {
      this.toast.success('Campaign Sent', `${sent} notifications delivered successfully.`);
    }
  }

  get modalTitle(): string {
    const mode = this.modalMode();
    if (mode === 'add') return 'New Campaign';
    if (mode === 'edit') return `Edit: ${this.selectedCampaign()?.name ?? ''}`;
    if (mode === 'execute') return `Run Campaign`;
    return '';
  }

  get confirmLabel(): string {
    const mode = this.modalMode();
    if (mode === 'add') return 'Create Draft';
    if (mode === 'edit') return 'Save Changes';
    if (mode === 'execute') return this.executeResults() ? 'Done' : 'Send Notifications';
    return 'Confirm';
  }

  onModalConfirm(): void {
    const mode = this.modalMode();
    if (mode === 'add' || mode === 'edit') { this.saveCampaign(); return; }
    if (mode === 'execute') {
      if (this.executeResults()) { this.closeModal(); return; }
      this.runCampaign();
    }
  }

  private emptyForm(): CampaignForm {
    return { name: '', description: '', effectiveFrom: '', toDate: '', channel: NotificationChannel.Email, criteria: [] };
  }

  private emptyCriterionDraft(): CriterionDraft {
    return { departmentKey: '', categoryKey: '', subCategoryKey: '' };
  }
}
