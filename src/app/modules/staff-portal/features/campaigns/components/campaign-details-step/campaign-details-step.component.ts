import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent, IconName } from '@shared/components/icon/icon.component';
import { CampaignTargetCriteria, NotificationChannel, DeptCategory, SubCategory } from '@core/models/domain.models';
import { CampaignFormState, CriterionDraftState, ChannelOption } from '../../models/campaigns.state';
import { DepartmentResponse } from '../../models/campaigns.response';
import { criterionLabel } from '../../models/campaigns.mapper';

@Component({
  selector: 'app-campaign-details-step',
  standalone: true,
  imports: [FormsModule, IconComponent],
  templateUrl: './campaign-details-step.component.html',
  styleUrl: './campaign-details-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignDetailsStepComponent {
  readonly form = input.required<CampaignFormState>();
  readonly criterionDraft = input.required<CriterionDraftState>();
  readonly departments = input.required<DepartmentResponse[]>();
  readonly isViewMode = input.required<boolean>();

  readonly formChanged = output<CampaignFormState>();
  readonly criterionDraftChanged = output<CriterionDraftState>();
  readonly criterionAdded = output<void>();
  readonly criterionRemoved = output<number>();

  protected readonly channelOptions: ChannelOption[] = [
    { value: NotificationChannel.Email, label: 'Email', icon: 'mail', desc: 'Send email notifications' },
    { value: NotificationChannel.SMS, label: 'SMS', icon: 'phone', desc: 'Send SMS text messages' },
    { value: NotificationChannel.Both, label: 'Both', icon: 'send', desc: 'Email + SMS' }
  ];

  get draftCategories(): DeptCategory[] {
    const draft = this.criterionDraft();
    if (!draft.departmentKey) return [];
    return this.departments().find(d => d.key === draft.departmentKey)?.categories ?? [];
  }

  get draftSubCategories(): SubCategory[] {
    const draft = this.criterionDraft();
    return this.draftCategories.find(c => c.key === draft.categoryKey)?.subCategories ?? [];
  }

  getCriterionLabel(c: CampaignTargetCriteria): string {
    return criterionLabel(c);
  }

  updateFormField(field: keyof CampaignFormState, value: any): void {
    this.formChanged.emit({ ...this.form(), [field]: value });
  }

  selectChannel(channel: NotificationChannel): void {
    if (!this.isViewMode()) {
      this.formChanged.emit({ ...this.form(), channel });
    }
  }

  updateDraftField(
    field: keyof CriterionDraftState,
    value: string,
    resetFields: (keyof CriterionDraftState)[] = []
  ): void {
    const updated = { ...this.criterionDraft(), [field]: value };
    for (const f of resetFields) {
      updated[f] = '';
    }
    this.criterionDraftChanged.emit(updated);
  }
}
