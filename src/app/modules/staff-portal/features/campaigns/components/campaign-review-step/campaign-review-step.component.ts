import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { NotificationChannel, CampaignTargetCriteria, EmailBlock } from '@core/models/domain.models';
import { CampaignFormState } from '../../models/campaigns.state';
import { channelLabel, criterionLabel, smsCharCount, smsSegments } from '../../models/campaigns.mapper';

@Component({
  selector: 'app-campaign-review-step',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './campaign-review-step.component.html',
  styleUrl: './campaign-review-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignReviewStepComponent {
  readonly form = input.required<CampaignFormState>();
  readonly emailBlocks = input.required<EmailBlock[]>();
  readonly emailSubject = input.required<string>();
  readonly smsBody = input.required<string>();
  readonly isViewMode = input.required<boolean>();
  readonly hasRequiredTemplates = input.required<boolean>();

  readonly goToStep = output<number>();

  get showEmailStep(): boolean {
    const ch = this.form().channel;
    return ch === NotificationChannel.Email || ch === NotificationChannel.Both;
  }

  get showSmsStep(): boolean {
    const ch = this.form().channel;
    return ch === NotificationChannel.SMS || ch === NotificationChannel.Both;
  }

  get channelLabelText(): string {
    return channelLabel(this.form().channel);
  }

  get smsCharCountVal(): number {
    return smsCharCount(this.smsBody());
  }

  get smsSegmentsVal(): number {
    return smsSegments(this.smsBody());
  }

  getCriterionLabel(c: CampaignTargetCriteria): string {
    return criterionLabel(c);
  }
}
