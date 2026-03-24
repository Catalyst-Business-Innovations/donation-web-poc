import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { ToastService } from '@core/services/toast.service';
import {
  Campaign,
  CampaignStatus,
  NotificationChannel,
  CampaignTargetCriteria,
  EmailBlock,
  EmailBlockType,
  EmailStarterTemplate
} from '@core/models/domain.models';
import { CampaignService } from '../services/campaign.service';
import { PageMode, WizardIntent } from '../models/campaigns.enum';
import {
  CampaignFormState,
  CampaignListItemState,
  CriterionDraftState,
  WizardStepState,
  ExecuteResult
} from '../models/campaigns.state';
import { CampaignResponse } from '../models/campaigns.response';
import { emptyForm, mapCampaignToForm } from '../models/campaigns.mapper';
import { CampaignListFiltersComponent } from '../components/campaign-list-filters/campaign-list-filters.component';
import { CampaignStatusCountsComponent } from '../components/campaign-status-counts/campaign-status-counts.component';
import { CampaignTableComponent } from '../components/campaign-table/campaign-table.component';
import { CampaignExecuteModalComponent } from '../components/campaign-execute-modal/campaign-execute-modal.component';
import { CampaignWizardShellComponent } from '../components/campaign-wizard-shell/campaign-wizard-shell.component';
import { CampaignDetailsStepComponent } from '../components/campaign-details-step/campaign-details-step.component';
import { EmailTemplateStepComponent } from '../components/email-template-step/email-template-step.component';
import { SmsTemplateStepComponent } from '../components/sms-template-step/sms-template-step.component';
import { CampaignReviewStepComponent } from '../components/campaign-review-step/campaign-review-step.component';

@Component({
  selector: 'app-campaigns-page',
  standalone: true,
  imports: [
    CampaignListFiltersComponent,
    CampaignStatusCountsComponent,
    CampaignTableComponent,
    CampaignExecuteModalComponent,
    CampaignWizardShellComponent,
    CampaignDetailsStepComponent,
    EmailTemplateStepComponent,
    SmsTemplateStepComponent,
    CampaignReviewStepComponent
  ],
  templateUrl: './campaigns-page.component.html',
  styleUrl: './campaigns-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignsPageComponent {
  private readonly campaignService = inject(CampaignService);
  private readonly toast = inject(ToastService);

  // ── Page mode ──
  protected readonly pageMode = signal<PageMode>('list');
  protected readonly wizardIntent = signal<WizardIntent>('add');

  // ── List state ──
  protected readonly statusFilter = signal<CampaignStatus | ''>('');
  protected readonly query = signal('');

  // ── Execute modal ──
  protected readonly showExecuteModal = signal(false);
  protected readonly executeCampaign = signal<CampaignListItemState | null>(null);
  protected readonly executeResults = signal<ExecuteResult | null>(null);

  // ── Wizard state ──
  protected readonly wizardStep = signal(1);
  protected readonly editingCampaignId = signal<number | null>(null);
  protected readonly editingCampaignStatus = signal<CampaignStatus>(CampaignStatus.Draft);
  protected readonly editingCampaignHistory = signal<any[]>([]);
  protected readonly form = signal<CampaignFormState>(emptyForm());
  protected readonly criterionDraft = signal<CriterionDraftState>({
    departmentKey: '',
    categoryKey: '',
    subCategoryKey: ''
  });

  // Email block builder
  protected readonly emailSubject = signal('');
  protected readonly emailBlocks = signal<EmailBlock[]>([]);
  protected readonly selectedBlockId = signal<string | null>(null);
  protected readonly showStarterPicker = signal(false);

  // SMS
  protected readonly smsBody = signal('');

  // ── Departments ──
  protected readonly departments = this.campaignService.getDepartments();

  // ── Computed: list ──
  protected readonly filtered = computed(() => {
    // Trigger reactivity
    this.query();
    this.statusFilter();
    return this.campaignService.getFilteredCampaigns(this.query(), this.statusFilter());
  });

  protected readonly counts = computed(() => this.campaignService.getStatusCounts());

  // ── Wizard step visibility ──
  protected readonly showEmailStep = computed(() => {
    const ch = this.form().channel;
    return ch === NotificationChannel.Email || ch === NotificationChannel.Both;
  });

  protected readonly showSmsStep = computed(() => {
    const ch = this.form().channel;
    return ch === NotificationChannel.SMS || ch === NotificationChannel.Both;
  });

  protected readonly wizardSteps = computed<WizardStepState[]>(() => {
    return [
      { num: 1, label: 'Details', visible: true },
      { num: 2, label: 'Email Template', visible: this.showEmailStep() },
      { num: 3, label: 'SMS Template', visible: this.showSmsStep() },
      { num: 4, label: 'Review', visible: true }
    ].filter(s => s.visible);
  });

  protected readonly visibleStepNums = computed(() => this.wizardSteps().map(s => s.num));

  protected readonly currentStepIndex = computed(() => this.visibleStepNums().indexOf(this.wizardStep()));

  protected readonly isFirstStep = computed(() => this.currentStepIndex() === 0);

  protected readonly isLastStep = computed(() => this.currentStepIndex() === this.visibleStepNums().length - 1);

  protected readonly isViewMode = computed(() => this.wizardIntent() === 'view');

  protected readonly wizardTitle = computed(() => {
    const intent = this.wizardIntent();
    if (intent === 'add') return 'Create Campaign';
    if (intent === 'edit') return `Edit: ${this.form().name}`;
    return `View: ${this.form().name}`;
  });

  protected readonly canProceedStep1 = computed(() => !!this.form().name.trim());

  protected readonly hasRequiredTemplates = computed(() => {
    if (this.showEmailStep() && this.emailBlocks().length === 0) return false;
    if (this.showSmsStep() && !this.smsBody().trim()) return false;
    return true;
  });

  protected readonly stepProgress = computed(
    () => `Step ${this.currentStepIndex() + 1} of ${this.visibleStepNums().length}`
  );

  // ── Email preview ──
  protected readonly emailSubjectPreview = computed(() =>
    this.campaignService.previewTemplate(this.emailSubject(), this.form().name || 'Campaign')
  );

  protected readonly smsBodyPreview = computed(() =>
    this.campaignService.previewTemplate(this.smsBody(), this.form().name || 'Campaign')
  );

  // ═══════════════════════════════════════════════════════════════
  // LIST ACTIONS
  // ═══════════════════════════════════════════════════════════════

  onQueryChanged(q: string): void {
    this.query.set(q);
  }

  onStatusFilterChanged(sf: CampaignStatus | ''): void {
    this.statusFilter.set(sf);
  }

  onCreateClicked(): void {
    this.openWizard('add');
  }

  onViewCampaign(item: CampaignListItemState): void {
    const campaign = this.campaignService.getCampaigns().find(c => c.id === item.id);
    if (campaign) this.openWizard('view', campaign);
  }

  onEditCampaign(item: CampaignListItemState): void {
    const campaign = this.campaignService.getCampaigns().find(c => c.id === item.id);
    if (campaign) this.openWizard('edit', campaign);
  }

  onActivateCampaign(item: CampaignListItemState): void {
    this.campaignService.activateCampaign(item.id);
    this.toast.success('Activated', `"${item.name}" is now Active.`);
  }

  onPauseCampaign(item: CampaignListItemState): void {
    this.campaignService.pauseCampaign(item.id);
    this.toast.info('Paused', `"${item.name}" has been paused.`);
  }

  onOpenExecute(item: CampaignListItemState): void {
    this.executeCampaign.set(item);
    this.executeResults.set(null);
    this.showExecuteModal.set(true);
  }

  onRunCampaign(): void {
    const c = this.executeCampaign();
    if (!c) return;
    const results = this.campaignService.executeCampaign(c.id);
    this.executeResults.set(results);
    if (results.sent > 0) this.toast.success('Campaign Sent', `${results.sent} notifications delivered.`);
  }

  onCloseExecuteModal(): void {
    this.showExecuteModal.set(false);
    this.executeCampaign.set(null);
    this.executeResults.set(null);
  }

  // ═══════════════════════════════════════════════════════════════
  // WIZARD NAVIGATION
  // ═══════════════════════════════════════════════════════════════

  private openWizard(intent: WizardIntent, campaign?: CampaignResponse): void {
    this.wizardIntent.set(intent);
    this.wizardStep.set(1);
    this.showStarterPicker.set(false);
    this.selectedBlockId.set(null);

    if (campaign) {
      this.editingCampaignId.set(campaign.id);
      this.editingCampaignStatus.set(campaign.status);
      this.editingCampaignHistory.set(campaign.notificationHistory);
      this.form.set(mapCampaignToForm(campaign));
      this.emailSubject.set(campaign.emailTemplate?.subject ?? '');
      this.emailBlocks.set(campaign.emailTemplate?.blocks ? campaign.emailTemplate.blocks.map(b => ({ ...b })) : []);
      this.smsBody.set(campaign.smsTemplate?.body ?? '');
    } else {
      this.editingCampaignId.set(null);
      this.editingCampaignStatus.set(CampaignStatus.Draft);
      this.editingCampaignHistory.set([]);
      this.form.set(emptyForm());
      this.emailSubject.set('');
      this.emailBlocks.set([]);
      this.smsBody.set('');
    }
    this.criterionDraft.set({ departmentKey: '', categoryKey: '', subCategoryKey: '' });
    this.pageMode.set('wizard');
  }

  onCloseWizard(): void {
    this.pageMode.set('list');
    this.editingCampaignId.set(null);
  }

  onNextStep(): void {
    const nums = this.visibleStepNums();
    const idx = this.currentStepIndex();
    if (idx < nums.length - 1) this.wizardStep.set(nums[idx + 1]);
  }

  onPrevStep(): void {
    const nums = this.visibleStepNums();
    const idx = this.currentStepIndex();
    if (idx > 0) this.wizardStep.set(nums[idx - 1]);
  }

  onGoToStep(n: number): void {
    if (this.visibleStepNums().includes(n)) this.wizardStep.set(n);
  }

  onSwitchToEdit(): void {
    this.wizardIntent.set('edit');
  }

  // ═══════════════════════════════════════════════════════════════
  // FORM UPDATES
  // ═══════════════════════════════════════════════════════════════

  onFormChanged(updatedForm: CampaignFormState): void {
    this.form.set(updatedForm);
  }

  onCriterionDraftChanged(draft: CriterionDraftState): void {
    this.criterionDraft.set(draft);
  }

  onCriterionAdded(): void {
    const d = this.criterionDraft();
    if (!d.departmentKey) return;
    const dept = this.departments.find((dep: any) => dep.key === d.departmentKey);
    const deptCats = dept?.categories ?? [];
    const cat = deptCats.find((c: any) => c.key === d.categoryKey);
    const catSubs = cat?.subCategories ?? [];
    const sub = catSubs.find((s: any) => s.key === d.subCategoryKey);
    const criterion: CampaignTargetCriteria = {
      departmentKey: dept?.key,
      departmentName: dept?.name,
      categoryKey: cat?.key,
      categoryName: cat?.name,
      subCategoryKey: sub?.key,
      subCategoryName: sub?.name
    };
    this.form.update(f => ({ ...f, criteria: [...f.criteria, criterion] }));
    this.criterionDraft.set({ departmentKey: '', categoryKey: '', subCategoryKey: '' });
  }

  onCriterionRemoved(index: number): void {
    this.form.update(f => ({ ...f, criteria: f.criteria.filter((_, i) => i !== index) }));
  }

  // ═══════════════════════════════════════════════════════════════
  // EMAIL BLOCK BUILDER
  // ═══════════════════════════════════════════════════════════════

  private nextBlockId(): string {
    return 'b' + Date.now() + Math.random().toString(36).substring(2, 6);
  }

  onEmailSubjectChanged(subject: string): void {
    this.emailSubject.set(subject);
  }

  onStarterApplied(starter: EmailStarterTemplate): void {
    this.emailSubject.set(starter.subject);
    this.emailBlocks.set(starter.blocks.map(b => ({ ...b, id: this.nextBlockId() })));
    this.showStarterPicker.set(false);
    this.selectedBlockId.set(null);
  }

  onBlockAdded(type: EmailBlockType): void {
    const block: EmailBlock = {
      id: this.nextBlockId(),
      type,
      content: type === 'header' ? 'Heading' : type === 'button' ? 'Click Here' : '',
      align: type === 'divider' || type === 'button' || type === 'header' ? 'center' : 'left',
      meta: type === 'button' ? 'https://' : undefined,
      level: type === 'header' ? 1 : type === 'spacer' ? 20 : undefined
    };
    this.emailBlocks.update(blocks => [...blocks, block]);
    this.selectedBlockId.set(block.id);
  }

  onBlockSelected(id: string): void {
    this.selectedBlockId.set(this.selectedBlockId() === id ? null : id);
  }

  onBlockUpdated(event: { id: string; patch: Partial<EmailBlock> }): void {
    this.emailBlocks.update(blocks => blocks.map(b => (b.id === event.id ? { ...b, ...event.patch } : b)));
  }

  onBlockRemoved(id: string): void {
    this.emailBlocks.update(blocks => blocks.filter(b => b.id !== id));
    if (this.selectedBlockId() === id) this.selectedBlockId.set(null);
  }

  onBlockMoved(event: { id: string; dir: -1 | 1 }): void {
    this.emailBlocks.update(blocks => {
      const idx = blocks.findIndex(b => b.id === event.id);
      if (idx < 0) return blocks;
      const target = idx + event.dir;
      if (target < 0 || target >= blocks.length) return blocks;
      const arr = [...blocks];
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return arr;
    });
  }

  onStarterPickerToggled(): void {
    this.showStarterPicker.update(v => !v);
  }

  // ═══════════════════════════════════════════════════════════════
  // SMS
  // ═══════════════════════════════════════════════════════════════

  onSmsBodyChanged(body: string): void {
    this.smsBody.set(body);
  }

  // ═══════════════════════════════════════════════════════════════
  // SAVE
  // ═══════════════════════════════════════════════════════════════

  onSaveCampaign(): void {
    if (!this.canProceedStep1()) {
      this.toast.warning('Incomplete', 'Campaign name is required.');
      return;
    }
    const intent = this.wizardIntent();
    if (intent === 'add') {
      const name = this.campaignService.createCampaign(
        this.form(),
        this.emailBlocks(),
        this.emailSubject(),
        this.smsBody()
      );
      this.toast.success('Created', `Campaign "${name}" created as Draft.`);
    } else {
      const name = this.campaignService.updateCampaign(
        this.editingCampaignId()!,
        this.form(),
        this.editingCampaignStatus(),
        this.editingCampaignHistory(),
        this.emailBlocks(),
        this.emailSubject(),
        this.smsBody()
      );
      this.toast.success('Saved', `Campaign "${name}" updated.`);
    }
    this.onCloseWizard();
  }
}
