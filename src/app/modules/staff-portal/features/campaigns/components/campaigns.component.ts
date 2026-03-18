import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MockDataService } from '../../../../../core/services/mock-data.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import {
  Campaign, CampaignStatus, CampaignStatusLabel,
  NotificationChannel, NotificationChannelLabel
} from '../../../../../core/models/domain.models';

interface CampaignForm {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  channel: NotificationChannel;
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
    this.selectedCampaign.set(null);
    this.modalMode.set('add');
  }

  openEdit(c: Campaign, event: Event): void {
    event.stopPropagation();
    this.selectedCampaign.set(c);
    this.form = {
      name:        c.name,
      description: c.description,
      startDate:   c.startDate.toISOString().split('T')[0],
      endDate:     c.endDate.toISOString().split('T')[0],
      channel:     c.channel,
    };
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

  saveCampaign(): void {
    const mode = this.modalMode();
    const payload = {
      name:        this.form.name.trim(),
      description: this.form.description.trim(),
      startDate:   new Date(this.form.startDate),
      endDate:     new Date(this.form.endDate),
      channel:     this.form.channel,
      status:      mode === 'add' ? CampaignStatus.Draft : this.selectedCampaign()!.status,
      targetCriteria: mode === 'edit' ? this.selectedCampaign()!.targetCriteria : [],
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
    const today = new Date().toISOString().split('T')[0];
    return { name: '', description: '', startDate: today, endDate: today, channel: NotificationChannel.Email };
  }
}
