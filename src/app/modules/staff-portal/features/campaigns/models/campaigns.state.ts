import {
  CampaignStatus,
  NotificationChannel,
  CampaignTargetCriteria,
  EmailBlock,
  EmailBlockType
} from '@core/models/domain.models';
import { IconName } from '@shared/components/icon/icon.component';

export interface CampaignListItemState {
  id: number;
  name: string;
  description: string;
  channel: NotificationChannel;
  channelLabel: string;
  status: CampaignStatus;
  statusLabel: string;
  statusBadgeClass: string;
  startDate: Date;
  endDate: Date;
  targetCriteria: CampaignTargetCriteria[];
  notificationCount: number;
  templateStatus: 'ready' | 'partial' | 'none';
  isDraft: boolean;
  isActive: boolean;
  isPaused: boolean;
  emailTemplateSubject: string;
  emailTemplateBody: string;
  smsTemplateBody: string;
  hasRequiredTemplates: boolean;
}

export interface CampaignStatusCounts {
  draft: number;
  active: number;
  paused: number;
  completed: number;
}

export interface CampaignFormState {
  name: string;
  description: string;
  effectiveFrom: string;
  toDate: string;
  channel: NotificationChannel;
  criteria: CampaignTargetCriteria[];
}

export interface CriterionDraftState {
  departmentKey: string;
  categoryKey: string;
  subCategoryKey: string;
}

export interface TemplateFormState {
  subject: string;
  body: string;
}

export interface WizardStepState {
  num: number;
  label: string;
  visible: boolean;
}

export interface BlockTypeOption {
  type: EmailBlockType;
  label: string;
  icon: IconName;
}

export interface ChannelOption {
  value: NotificationChannel;
  label: string;
  icon: IconName;
  desc: string;
}

export interface ExecuteResult {
  sent: number;
  failed: number;
}
