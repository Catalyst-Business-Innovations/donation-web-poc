import { Injectable, inject } from '@angular/core';
import { MockDataService } from '@core/services/mock-data.service';
import {
  Campaign,
  CampaignStatus,
  NotificationChannel,
  NotificationTemplate,
  CampaignNotification,
  CampaignTargetCriteria,
  EmailBlock,
  Donor
} from '@core/models/domain.models';
import {
  CampaignListItemState,
  CampaignStatusCounts,
  CampaignFormState,
  ExecuteResult
} from '../models/campaigns.state';
import { CampaignResponse } from '../models/campaigns.response';
import {
  mapCampaignToListItem,
  computeStatusCounts,
  mapCampaignToForm,
  mapFormToCreateRequest,
  mapFormToUpdateRequest,
  blocksToHtml
} from '../models/campaigns.mapper';

@Injectable({ providedIn: 'root' })
export class CampaignService {
  private readonly mockData = inject(MockDataService);

  getCampaigns(): CampaignResponse[] {
    return this.mockData.campaigns() as CampaignResponse[];
  }

  getFilteredCampaigns(query: string, statusFilter: CampaignStatus | ''): CampaignListItemState[] {
    const q = query.toLowerCase();
    const all = this.getCampaigns();
    return all
      .filter(c => {
        const matchQuery = !q || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
        const matchStatus = !statusFilter || c.status === statusFilter;
        return matchQuery && matchStatus;
      })
      .map(mapCampaignToListItem);
  }

  getStatusCounts(): CampaignStatusCounts {
    return computeStatusCounts(this.getCampaigns());
  }

  getDepartments() {
    return this.mockData.departments;
  }

  getStaffId(): number {
    return this.mockData.session.staffId;
  }

  createCampaign(form: CampaignFormState, emailBlocks: EmailBlock[], emailSubject: string, smsBody: string): string {
    const showEmail = form.channel === NotificationChannel.Email || form.channel === NotificationChannel.Both;
    const showSms = form.channel === NotificationChannel.SMS || form.channel === NotificationChannel.Both;

    let emailTemplate: NotificationTemplate | undefined;
    if (showEmail && emailBlocks.length > 0) {
      emailTemplate = {
        channel: NotificationChannel.Email,
        subject: emailSubject.trim(),
        body: blocksToHtml(emailBlocks),
        blocks: emailBlocks.map(b => ({ ...b })),
        updatedAt: new Date()
      };
    }

    let smsTemplate: NotificationTemplate | undefined;
    if (showSms && smsBody.trim()) {
      smsTemplate = {
        channel: NotificationChannel.SMS,
        subject: '',
        body: smsBody,
        updatedAt: new Date()
      };
    }

    const request = mapFormToCreateRequest(form, this.getStaffId(), emailTemplate, smsTemplate);
    this.mockData.createCampaign(request);
    return request.name;
  }

  updateCampaign(
    campaignId: number,
    form: CampaignFormState,
    currentStatus: CampaignStatus,
    currentHistory: CampaignNotification[],
    emailBlocks: EmailBlock[],
    emailSubject: string,
    smsBody: string
  ): string {
    const showEmail = form.channel === NotificationChannel.Email || form.channel === NotificationChannel.Both;
    const showSms = form.channel === NotificationChannel.SMS || form.channel === NotificationChannel.Both;

    let emailTemplate: NotificationTemplate | undefined;
    if (showEmail && emailBlocks.length > 0) {
      emailTemplate = {
        channel: NotificationChannel.Email,
        subject: emailSubject.trim(),
        body: blocksToHtml(emailBlocks),
        blocks: emailBlocks.map(b => ({ ...b })),
        updatedAt: new Date()
      };
    }

    let smsTemplate: NotificationTemplate | undefined;
    if (showSms && smsBody.trim()) {
      smsTemplate = {
        channel: NotificationChannel.SMS,
        subject: '',
        body: smsBody,
        updatedAt: new Date()
      };
    }

    const request = mapFormToUpdateRequest(
      form,
      currentStatus,
      currentHistory,
      this.getStaffId(),
      emailTemplate,
      smsTemplate
    );
    this.mockData.updateCampaign(campaignId, request);
    return request.name;
  }

  activateCampaign(id: number): void {
    this.mockData.updateCampaign(id, { status: CampaignStatus.Active });
  }

  pauseCampaign(id: number): void {
    this.mockData.updateCampaign(id, { status: CampaignStatus.Paused });
  }

  executeCampaign(campaignId: number): ExecuteResult {
    const notifications = this.mockData.executeCampaign(campaignId);
    return {
      sent: notifications.filter(n => n.success).length,
      failed: notifications.filter(n => !n.success).length
    };
  }

  previewTemplate(text: string, campaignName: string): string {
    const dummyDonor = {
      id: 0,
      referenceNumber: 'D-000',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      phone: '(555) 123-4567',
      address: '123 Main St, Springfield, IL 62701',
      loyaltyPoints: 1250,
      loyaltyTier: 3,
      totalDonations: 15,
      totalDonatedValue: 1800,
      lifetimeValue: 1800,
      joinedDate: new Date('2024-01-15'),
      joinDate: new Date('2024-01-15'),
      categoryInterests: [],
      donationHistory: []
    } as unknown as Donor;
    return this.mockData.previewTemplate(text, dummyDonor, campaignName || 'Campaign');
  }
}
