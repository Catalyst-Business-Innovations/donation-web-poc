import {
  Campaign,
  CampaignStatus,
  CampaignStatusLabel,
  NotificationChannel,
  NotificationChannelLabel,
  NotificationTemplate,
  CampaignTargetCriteria,
  EmailBlock
} from '@core/models/domain.models';
import { CampaignStatusBadgeClass } from './campaigns.enum';
import { CampaignListItemState, CampaignFormState, CampaignStatusCounts } from './campaigns.state';
import { CampaignResponse } from './campaigns.response';
import { CreateCampaignRequest, UpdateCampaignRequest } from './campaigns.request';

// ── List mapping ──────────────────────────────────────────────────────────────

export function mapCampaignToListItem(c: CampaignResponse): CampaignListItemState {
  const needEmail = c.channel === NotificationChannel.Email || c.channel === NotificationChannel.Both;
  const needSms = c.channel === NotificationChannel.SMS || c.channel === NotificationChannel.Both;
  const hasEmail = !!c.emailTemplate?.body?.trim();
  const hasSms = !!c.smsTemplate?.body?.trim();
  const fulfilled = (!needEmail || hasEmail) && (!needSms || hasSms);
  const partial = (needEmail && hasEmail) || (needSms && hasSms);

  let templateStatus: 'ready' | 'partial' | 'none';
  if (fulfilled) templateStatus = 'ready';
  else if (partial) templateStatus = 'partial';
  else templateStatus = 'none';

  return {
    id: c.id,
    name: c.name,
    description: c.description,
    channel: c.channel,
    channelLabel: NotificationChannelLabel[c.channel] ?? String(c.channel),
    status: c.status,
    statusLabel: CampaignStatusLabel[c.status] ?? String(c.status),
    statusBadgeClass: CampaignStatusBadgeClass[c.status] ?? 'badge-gray',
    startDate: c.startDate,
    endDate: c.endDate,
    targetCriteria: c.targetCriteria,
    notificationCount: c.notificationHistory.length,
    templateStatus,
    isDraft: c.status === CampaignStatus.Draft,
    isActive: c.status === CampaignStatus.Active,
    isPaused: c.status === CampaignStatus.Paused,
    emailTemplateSubject: c.emailTemplate?.subject ?? '',
    emailTemplateBody: c.emailTemplate?.body ?? '',
    smsTemplateBody: c.smsTemplate?.body ?? '',
    hasRequiredTemplates: fulfilled
  };
}

export function computeStatusCounts(campaigns: CampaignResponse[]): CampaignStatusCounts {
  return {
    draft: campaigns.filter(c => c.status === CampaignStatus.Draft).length,
    active: campaigns.filter(c => c.status === CampaignStatus.Active).length,
    paused: campaigns.filter(c => c.status === CampaignStatus.Paused).length,
    completed: campaigns.filter(c => c.status === CampaignStatus.Completed).length
  };
}

// ── Form mapping ──────────────────────────────────────────────────────────────

export function mapCampaignToForm(c: CampaignResponse): CampaignFormState {
  return {
    name: c.name,
    description: c.description,
    effectiveFrom: c.startDate ? c.startDate.toISOString().split('T')[0] : '',
    toDate: c.endDate ? c.endDate.toISOString().split('T')[0] : '',
    channel: c.channel,
    criteria: [...(c.targetCriteria ?? [])]
  };
}

export function mapFormToCreateRequest(
  form: CampaignFormState,
  staffId: number,
  emailTemplate?: NotificationTemplate,
  smsTemplate?: NotificationTemplate
): CreateCampaignRequest {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    startDate: form.effectiveFrom ? new Date(form.effectiveFrom) : new Date(),
    endDate: form.toDate ? new Date(form.toDate) : new Date('2099-12-31'),
    channel: form.channel,
    status: CampaignStatus.Draft,
    targetCriteria: form.criteria,
    notificationHistory: [],
    createdByStaffId: staffId,
    emailTemplate,
    smsTemplate
  };
}

export function mapFormToUpdateRequest(
  form: CampaignFormState,
  currentStatus: CampaignStatus,
  currentHistory: any[],
  staffId: number,
  emailTemplate?: NotificationTemplate,
  smsTemplate?: NotificationTemplate
): CreateCampaignRequest {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    startDate: form.effectiveFrom ? new Date(form.effectiveFrom) : new Date(),
    endDate: form.toDate ? new Date(form.toDate) : new Date('2099-12-31'),
    channel: form.channel,
    status: currentStatus,
    targetCriteria: form.criteria,
    notificationHistory: currentHistory,
    createdByStaffId: staffId,
    emailTemplate,
    smsTemplate
  };
}

export function emptyForm(): CampaignFormState {
  return {
    name: '',
    description: '',
    effectiveFrom: '',
    toDate: '',
    channel: NotificationChannel.Email,
    criteria: []
  };
}

// ── Badge mapping ─────────────────────────────────────────────────────────────

export function statusBadgeClass(s: CampaignStatus): string {
  return CampaignStatusBadgeClass[s] ?? 'badge-gray';
}

export function statusLabel(s: CampaignStatus): string {
  return CampaignStatusLabel[s] ?? String(s);
}

export function channelLabel(c: NotificationChannel): string {
  return NotificationChannelLabel[c] ?? String(c);
}

// ── Criterion label ───────────────────────────────────────────────────────────

export function criterionLabel(c: CampaignTargetCriteria): string {
  return [c.departmentName, c.categoryName, c.subCategoryName].filter(Boolean).join(' > ');
}

// ── Email blocks to HTML ──────────────────────────────────────────────────────

export function blocksToHtml(blocks: EmailBlock[]): string {
  return blocks
    .map(b => {
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
    })
    .join('\n');
}

// ── SMS counting ──────────────────────────────────────────────────────────────

export function smsCharCount(body: string): number {
  return body.length;
}

export function smsSegments(body: string): number {
  const len = body.length;
  if (len === 0) return 0;
  if (len <= 160) return 1;
  return Math.ceil(len / 153);
}

// ── Template preview ──────────────────────────────────────────────────────────

export function previewTemplate(text: string, campaignName: string): string {
  const dummyReplacements: Record<string, string> = {
    '{{donor_name}}': 'Jane Doe',
    '{{first_name}}': 'Jane',
    '{{campaign_name}}': campaignName || 'Campaign',
    '{{points}}': '1,250',
    '{{tier}}': 'Gold',
    '{{org_name}}': 'Our Organization'
  };
  let result = text;
  for (const [key, value] of Object.entries(dummyReplacements)) {
    result = result.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
  }
  return result;
}
