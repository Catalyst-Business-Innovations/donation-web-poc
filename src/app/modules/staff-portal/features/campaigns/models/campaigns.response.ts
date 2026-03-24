import {
  CampaignStatus,
  NotificationChannel,
  CampaignTargetCriteria,
  CampaignNotification,
  NotificationTemplate,
  DonationDepartment
} from '@core/models/domain.models';

export interface CampaignResponse {
  id: number;
  referenceNumber: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: CampaignStatus;
  channel: NotificationChannel;
  targetCriteria: CampaignTargetCriteria[];
  notificationHistory: CampaignNotification[];
  emailTemplate?: NotificationTemplate;
  smsTemplate?: NotificationTemplate;
  createdAt: Date;
  createdByStaffId: number;
}

export type DepartmentResponse = DonationDepartment;
