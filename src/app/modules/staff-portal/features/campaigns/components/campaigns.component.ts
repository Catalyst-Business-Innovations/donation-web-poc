import { Component, inject, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { MockDataService } from '../../../../../core/services/mock-data.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { IconComponent, IconName } from '../../../../../shared/components/icon/icon.component';
import {
  Campaign, CampaignStatus, CampaignStatusLabel,
  CampaignTargetCriteria,
  NotificationChannel, NotificationChannelLabel,
  NotificationTemplate, TemplateMergeVariables,
  EmailBlock, EmailBlockType, EmailStarterTemplate,
  EMAIL_STARTER_TEMPLATES, Donor,
} from '../../../../../core/models/domain.models';

// ── Interfaces ──
interface CampaignForm {
  name: string;
  description: string;
  effectiveFrom: string;
  toDate: string;
  channel: NotificationChannel;
  criteria: CampaignTargetCriteria[];
}

interface TemplateForm {
  subject: string;
  body: string;
}

interface CriterionDraft {
  departmentKey: string;
  categoryKey: string;
  subCategoryKey: string;
}

type PageMode = 'list' | 'wizard';
type WizardIntent = 'add' | 'edit' | 'view';

@Component({
  selector: 'app-campaigns',
  standalone: true,
  imports: [FormsModule, DatePipe, TitleCasePipe, ModalComponent, IconComponent],
  templateUrl: './campaigns.component.html',
  styleUrl: './campaigns.component.scss'
})
export class CampaignsComponent {
  protected svc = inject(MockDataService);
  protected toast = inject(ToastService);

  // ── Constants ──
  protected readonly CS = CampaignStatus;
  protected readonly NC = NotificationChannel;
  protected readonly NCLabel = NotificationChannelLabel;
  protected readonly mergeVars = TemplateMergeVariables;
  protected readonly starters = EMAIL_STARTER_TEMPLATES;
  protected readonly blockTypes: { type: EmailBlockType; label: string; icon: IconName }[] = [
    { type: 'header',  label: 'Heading',  icon: 'file-text' },
    { type: 'text',    label: 'Text',     icon: 'file' },
    { type: 'button',  label: 'Button',   icon: 'arrow-right' },
    { type: 'divider', label: 'Divider',  icon: 'more-vertical' },
    { type: 'image',   label: 'Image',    icon: 'image' },
    { type: 'spacer',  label: 'Spacer',   icon: 'layers' },
  ];

  protected readonly channelOptions: { value: NotificationChannel; label: string; icon: IconName; desc: string }[] = [
    { value: NotificationChannel.Email, label: 'Email', icon: 'mail', desc: 'Send email notifications' },
    { value: NotificationChannel.SMS,   label: 'SMS',   icon: 'phone', desc: 'Send SMS text messages' },
    { value: NotificationChannel.Both,  label: 'Both',  icon: 'send', desc: 'Email + SMS' },
  ];

  // ── Page mode ──
  protected pageMode = signal<PageMode>('list');
  protected wizardIntent = signal<WizardIntent>('add');

  // ── List state ──
  protected statusFilter = signal<CampaignStatus | ''>('');
  protected query = signal('');

  // ── Execute modal ──
  protected showExecuteModal = signal(false);
  protected executeCampaign = signal<Campaign | null>(null);
  protected executeResults = signal<{ sent: number; failed: number } | null>(null);

  // ── Wizard state ──
  protected wizardStep = signal(1);
  protected editingCampaign = signal<Campaign | null>(null);
  protected form: CampaignForm = this.emptyForm();
  protected criterionDraft: CriterionDraft = this.emptyCriterionDraft();

  // Email block builder
  protected emailSubject = signal('');
  protected emailBlocks = signal<EmailBlock[]>([]);
  protected selectedBlockId = signal<string | null>(null);
  protected showStarterPicker = signal(false);
  protected emailPreviewMode = signal(false);


  // SMS
  protected smsForm: TemplateForm = { subject: '', body: '' };
  protected smsPreviewMode = signal(false);

  @ViewChild('smsBodyEditor') smsBodyRef?: ElementRef<HTMLTextAreaElement>;

  // ── Wizard step labels ──
  get wizardSteps(): { num: number; label: string; visible: boolean }[] {
    return [
      { num: 1, label: 'Details',        visible: true },
      { num: 2, label: 'Email Template', visible: this.showEmailStep },
      { num: 3, label: 'SMS Template',   visible: this.showSmsStep },
      { num: 4, label: 'Review',         visible: true },
    ].filter(s => s.visible);
  }

  get visibleStepNums(): number[] {
    return this.wizardSteps.map(s => s.num);
  }

  get currentStepIndex(): number {
    return this.visibleStepNums.indexOf(this.wizardStep());
  }

  get isFirstStep(): boolean { return this.currentStepIndex === 0; }
  get isLastStep(): boolean { return this.currentStepIndex === this.visibleStepNums.length - 1; }

  get showEmailStep(): boolean {
    return this.form.channel === NotificationChannel.Email || this.form.channel === NotificationChannel.Both;
  }
  get showSmsStep(): boolean {
    return this.form.channel === NotificationChannel.SMS || this.form.channel === NotificationChannel.Both;
  }

  get isViewMode(): boolean { return this.wizardIntent() === 'view'; }
  get wizardTitle(): string {
    const intent = this.wizardIntent();
    if (intent === 'add') return 'Create Campaign';
    if (intent === 'edit') return `Edit: ${this.editingCampaign()?.name ?? ''}`;
    return `View: ${this.editingCampaign()?.name ?? ''}`;
  }

  // ── Computed: list ──
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

  // ── Cascading dept/cat/subcat ──
  get draftCategories() {
    if (!this.criterionDraft.departmentKey) return [];
    return this.svc.departments.find(d => d.key === this.criterionDraft.departmentKey)?.categories ?? [];
  }
  get draftSubCategories() {
    return this.draftCategories.find(c => c.key === this.criterionDraft.categoryKey)?.subCategories ?? [];
  }

  // ── Validation ──
  get canProceedStep1(): boolean {
    return !!this.form.name.trim();
  }

  get hasRequiredTemplates(): boolean {
    if (this.showEmailStep && this.emailBlocks().length === 0) return false;
    if (this.showSmsStep && !this.smsForm.body.trim()) return false;
    return true;
  }

  // ── SMS counting ──
  get smsCharCount(): number { return this.smsForm.body.length; }
  get smsSegments(): number {
    const len = this.smsCharCount;
    if (len === 0) return 0;
    if (len <= 160) return 1;
    return Math.ceil(len / 153);
  }

  // ── Preview (uses a static dummy donor) ──
  private readonly dummyDonor = {
    id: 0, referenceNumber: 'D-000', firstName: 'Jane', lastName: 'Doe',
    email: 'jane.doe@example.com', phone: '(555) 123-4567',
    address: '123 Main St, Springfield, IL 62701',
    loyaltyPoints: 1250, loyaltyTier: 3, totalDonations: 15,
    totalDonatedValue: 1800, lifetimeValue: 1800,
    joinedDate: new Date('2024-01-15'), joinDate: new Date('2024-01-15'),
    categoryInterests: [], donationHistory: [],
  } as unknown as Donor;

  get emailSubjectPreview(): string {
    return this.svc.previewTemplate(this.emailSubject(), this.dummyDonor, this.form.name || 'Campaign');
  }

  get smsBodyPreview(): string {
    return this.svc.previewTemplate(this.smsForm.body, this.dummyDonor, this.form.name || 'Campaign');
  }

  previewBlockContent(content: string): string {
    return this.svc.previewTemplate(content, this.dummyDonor, this.form.name || 'Campaign');
  }

  // ── Helpers ──
  statusBadge(s: CampaignStatus): string {
    const m: Record<CampaignStatus, string> = {
      [CampaignStatus.Draft]: 'badge-gray',
      [CampaignStatus.Active]: 'badge-success',
      [CampaignStatus.Paused]: 'badge-warning',
      [CampaignStatus.Completed]: 'badge-info',
    };
    return m[s] ?? 'badge-gray';
  }
  statusLabel(s: CampaignStatus): string { return CampaignStatusLabel[s] ?? String(s); }
  channelLabel(c: NotificationChannel): string { return NotificationChannelLabel[c] ?? String(c); }

  templateStatus(c: Campaign): 'ready' | 'partial' | 'none' {
    const needEmail = c.channel === NotificationChannel.Email || c.channel === NotificationChannel.Both;
    const needSms = c.channel === NotificationChannel.SMS || c.channel === NotificationChannel.Both;
    const hasEmail = !!c.emailTemplate?.body?.trim();
    const hasSms = !!c.smsTemplate?.body?.trim();
    const fulfilled = (!needEmail || hasEmail) && (!needSms || hasSms);
    const partial = (needEmail && hasEmail) || (needSms && hasSms);
    if (fulfilled) return 'ready';
    if (partial) return 'partial';
    return 'none';
  }

  criterionLabel(c: CampaignTargetCriteria): string {
    return [c.departmentName, c.categoryName, c.subCategoryName].filter(Boolean).join(' › ');
  }

  blockIcon(type: EmailBlockType): IconName {
    return this.blockTypes.find(b => b.type === type)?.icon ?? 'file';
  }

  get stepProgress(): string {
    return `Step ${this.currentStepIndex + 1} of ${this.visibleStepNums.length}`;
  }

  get intentBadgeClass(): string {
    const intent = this.wizardIntent();
    if (intent === 'add') return 'intent-badge-create';
    if (intent === 'edit') return 'intent-badge-edit';
    return 'intent-badge-view';
  }

  get intentBadgeLabel(): string {
    const intent = this.wizardIntent();
    if (intent === 'add') return 'Creating';
    if (intent === 'edit') return 'Editing';
    return 'Viewing';
  }

  // ═══════════════════════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════════════════════

  openWizard(intent: WizardIntent, campaign?: Campaign): void {
    this.wizardIntent.set(intent);
    this.wizardStep.set(1);
    this.emailPreviewMode.set(false);
    this.smsPreviewMode.set(false);

    this.showStarterPicker.set(false);
    this.selectedBlockId.set(null);

    if (campaign) {
      this.editingCampaign.set(campaign);
      this.form = {
        name: campaign.name,
        description: campaign.description,
        effectiveFrom: campaign.startDate ? campaign.startDate.toISOString().split('T')[0] : '',
        toDate: campaign.endDate ? campaign.endDate.toISOString().split('T')[0] : '',
        channel: campaign.channel,
        criteria: [...(campaign.targetCriteria ?? [])],
      };
      this.emailSubject.set(campaign.emailTemplate?.subject ?? '');
      this.emailBlocks.set(campaign.emailTemplate?.blocks
        ? campaign.emailTemplate.blocks.map(b => ({ ...b }))
        : []);
      this.smsForm = campaign.smsTemplate
        ? { subject: '', body: campaign.smsTemplate.body }
        : { subject: '', body: '' };
    } else {
      this.editingCampaign.set(null);
      this.form = this.emptyForm();
      this.emailSubject.set('');
      this.emailBlocks.set([]);
      this.smsForm = { subject: '', body: '' };
    }
    this.criterionDraft = this.emptyCriterionDraft();
    this.pageMode.set('wizard');
  }

  closeWizard(): void {
    this.pageMode.set('list');
    this.editingCampaign.set(null);
  }

  nextStep(): void {
    const nums = this.visibleStepNums;
    const idx = this.currentStepIndex;
    if (idx < nums.length - 1) this.wizardStep.set(nums[idx + 1]);
  }

  prevStep(): void {
    const nums = this.visibleStepNums;
    const idx = this.currentStepIndex;
    if (idx > 0) this.wizardStep.set(nums[idx - 1]);
  }

  goToStep(n: number): void {
    if (this.visibleStepNums.includes(n)) this.wizardStep.set(n);
  }

  // ═══════════════════════════════════════════════════════════════
  // CRITERIA
  // ═══════════════════════════════════════════════════════════════

  addCriterion(): void {
    const d = this.criterionDraft;
    if (!d.departmentKey) return;
    const dept = this.svc.departments.find(dep => dep.key === d.departmentKey);
    const cat = this.draftCategories.find(c => c.key === d.categoryKey);
    const sub = this.draftSubCategories.find(s => s.key === d.subCategoryKey);
    this.form.criteria = [...this.form.criteria, {
      departmentKey: dept?.key, departmentName: dept?.name,
      categoryKey: cat?.key, categoryName: cat?.name,
      subCategoryKey: sub?.key, subCategoryName: sub?.name,
    }];
    this.criterionDraft = this.emptyCriterionDraft();
  }

  removeCriterion(index: number): void {
    this.form.criteria = this.form.criteria.filter((_, i) => i !== index);
  }

  // ═══════════════════════════════════════════════════════════════
  // EMAIL BLOCK BUILDER
  // ═══════════════════════════════════════════════════════════════

  private nextBlockId(): string { return 'b' + Date.now() + Math.random().toString(36).substring(2, 6); }

  applyStarter(starter: EmailStarterTemplate): void {
    this.emailSubject.set(starter.subject);
    this.emailBlocks.set(starter.blocks.map(b => ({ ...b, id: this.nextBlockId() })));
    this.showStarterPicker.set(false);
    this.selectedBlockId.set(null);
  }

  addBlock(type: EmailBlockType): void {
    const block: EmailBlock = {
      id: this.nextBlockId(),
      type,
      content: type === 'header' ? 'Heading' : type === 'button' ? 'Click Here' : '',
      align: type === 'divider' || type === 'button' || type === 'header' ? 'center' : 'left',
      meta: type === 'button' ? 'https://' : undefined,
      level: type === 'header' ? 1 : type === 'spacer' ? 20 : undefined,
    };
    this.emailBlocks.update(blocks => [...blocks, block]);
    this.selectedBlockId.set(block.id);
  }

  selectBlock(id: string): void {
    this.selectedBlockId.set(this.selectedBlockId() === id ? null : id);
  }

  get selectedBlock(): EmailBlock | null {
    return this.emailBlocks().find(b => b.id === this.selectedBlockId()) ?? null;
  }

  updateBlock(id: string, patch: Partial<EmailBlock>): void {
    this.emailBlocks.update(blocks =>
      blocks.map(b => b.id === id ? { ...b, ...patch } : b)
    );
  }

  removeBlock(id: string): void {
    this.emailBlocks.update(blocks => blocks.filter(b => b.id !== id));
    if (this.selectedBlockId() === id) this.selectedBlockId.set(null);
  }

  moveBlock(id: string, dir: -1 | 1): void {
    this.emailBlocks.update(blocks => {
      const idx = blocks.findIndex(b => b.id === id);
      if (idx < 0) return blocks;
      const target = idx + dir;
      if (target < 0 || target >= blocks.length) return blocks;
      const arr = [...blocks];
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return arr;
    });
  }

  /** Convert blocks to HTML for storage */
  blocksToHtml(): string {
    return this.emailBlocks().map(b => {
      const align = b.align || 'left';
      switch (b.type) {
        case 'header': {
          const lvl = b.level || 1;
          return `<h${lvl} style="text-align:${align}">${b.content}</h${lvl}>`;
        }
        case 'text':
          return `<p style="text-align:${align}">${b.content.replace(/\n/g, '<br>')}</p>`;
        case 'button':
          return `<p style="text-align:${align}"><a href="${b.meta || '#'}" style="display:inline-block;padding:12px 28px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-weight:700">${b.content}</a></p>`;
        case 'divider':
          return '<hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0">';
        case 'image':
          return `<p style="text-align:${align}"><img src="${b.meta || ''}" alt="${b.content}" style="max-width:100%;border-radius:8px"></p>`;
        case 'spacer':
          return `<div style="height:${b.level || 20}px"></div>`;
        default:
          return '';
      }
    }).join('\n');
  }

  // ═══════════════════════════════════════════════════════════════
  // SMS
  // ═══════════════════════════════════════════════════════════════

  insertSmsVariable(varKey: string): void {
    const el = this.smsBodyRef?.nativeElement;
    if (el) {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const before = this.smsForm.body.substring(0, start);
      const after = this.smsForm.body.substring(end);
      this.smsForm.body = before + varKey + after;
      setTimeout(() => { el.focus(); el.selectionStart = el.selectionEnd = start + varKey.length; });
    } else {
      this.smsForm.body += varKey;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SAVE
  // ═══════════════════════════════════════════════════════════════

  saveCampaign(): void {
    if (!this.canProceedStep1) {
      this.toast.warning('Incomplete', 'Campaign name is required.');
      return;
    }
    const intent = this.wizardIntent();
    const payload: any = {
      name: this.form.name.trim(),
      description: this.form.description.trim(),
      startDate: this.form.effectiveFrom ? new Date(this.form.effectiveFrom) : new Date(),
      endDate: this.form.toDate ? new Date(this.form.toDate) : new Date('2099-12-31'),
      channel: this.form.channel,
      status: intent === 'add' ? CampaignStatus.Draft : this.editingCampaign()!.status,
      targetCriteria: this.form.criteria,
      notificationHistory: intent === 'edit' ? this.editingCampaign()!.notificationHistory : [],
      createdByStaffId: this.svc.session.staffId,
    };

    if (this.showEmailStep && this.emailBlocks().length > 0) {
      payload.emailTemplate = {
        channel: NotificationChannel.Email,
        subject: this.emailSubject().trim(),
        body: this.blocksToHtml(),
        blocks: this.emailBlocks().map(b => ({ ...b })),
        updatedAt: new Date(),
      } as NotificationTemplate;
    }
    if (this.showSmsStep && this.smsForm.body.trim()) {
      payload.smsTemplate = {
        channel: NotificationChannel.SMS,
        subject: '',
        body: this.smsForm.body,
        updatedAt: new Date(),
      } as NotificationTemplate;
    }

    if (intent === 'add') {
      this.svc.createCampaign(payload);
      this.toast.success('Created', `Campaign "${payload.name}" created as Draft.`);
    } else {
      this.svc.updateCampaign(this.editingCampaign()!.id, payload);
      this.toast.success('Saved', `Campaign "${payload.name}" updated.`);
    }
    this.closeWizard();
  }

  // ═══════════════════════════════════════════════════════════════
  // LIST ACTIONS
  // ═══════════════════════════════════════════════════════════════

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

  openExecute(c: Campaign, event: Event): void {
    event.stopPropagation();
    this.executeCampaign.set(c);
    this.executeResults.set(null);
    this.showExecuteModal.set(true);
  }

  runCampaign(): void {
    const c = this.executeCampaign();
    if (!c) return;
    const notifications = this.svc.executeCampaign(c.id);
    const sent = notifications.filter(n => n.success).length;
    const failed = notifications.filter(n => !n.success).length;
    this.executeResults.set({ sent, failed });
    if (sent > 0) this.toast.success('Campaign Sent', `${sent} notifications delivered.`);
  }

  closeExecuteModal(): void {
    this.showExecuteModal.set(false);
    this.executeCampaign.set(null);
    this.executeResults.set(null);
  }

  execHasTemplates(): boolean {
    const c = this.executeCampaign();
    if (!c) return false;
    const needEmail = c.channel === NotificationChannel.Email || c.channel === NotificationChannel.Both;
    const needSms = c.channel === NotificationChannel.SMS || c.channel === NotificationChannel.Both;
    if (needEmail && (!c.emailTemplate || !c.emailTemplate.body.trim())) return false;
    if (needSms && (!c.smsTemplate || !c.smsTemplate.body.trim())) return false;
    return true;
  }

  // ── Helpers ──
  private emptyForm(): CampaignForm {
    return { name: '', description: '', effectiveFrom: '', toDate: '', channel: NotificationChannel.Email, criteria: [] };
  }
  private emptyCriterionDraft(): CriterionDraft {
    return { departmentKey: '', categoryKey: '', subCategoryKey: '' };
  }
}
