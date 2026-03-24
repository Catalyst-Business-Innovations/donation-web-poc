import {
  CampaignStatus,
  NotificationChannel,
  CampaignTargetCriteria,
  CampaignNotification,
  NotificationTemplate
} from '@core/models/domain.models';

export interface CreateCampaignRequest {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  channel: NotificationChannel;
  status: CampaignStatus;
  targetCriteria: CampaignTargetCriteria[];
  notificationHistory: CampaignNotification[];
  createdByStaffId: number;
  emailTemplate?: NotificationTemplate;
  smsTemplate?: NotificationTemplate;
}

export interface UpdateCampaignRequest {
  name?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  channel?: NotificationChannel;
  status?: CampaignStatus;
  targetCriteria?: CampaignTargetCriteria[];
  emailTemplate?: NotificationTemplate;
  smsTemplate?: NotificationTemplate;
}
