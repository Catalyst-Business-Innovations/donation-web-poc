import { CampaignStatus, NotificationChannel } from '@core/models/domain.models';

export type PageMode = 'list' | 'wizard';
export type WizardIntent = 'add' | 'edit' | 'view';

export const CampaignStatusBadgeClass: Record<CampaignStatus, string> = {
  [CampaignStatus.Draft]: 'badge-gray',
  [CampaignStatus.Active]: 'badge-success',
  [CampaignStatus.Paused]: 'badge-warning',
  [CampaignStatus.Completed]: 'badge-info'
};

export const ChannelBadgeClass: Record<NotificationChannel, string> = {
  [NotificationChannel.Email]: 'badge-info',
  [NotificationChannel.SMS]: 'badge-info',
  [NotificationChannel.Both]: 'badge-info'
};
