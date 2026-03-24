import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { CampaignListItemState, ExecuteResult } from '../../models/campaigns.state';

@Component({
  selector: 'app-campaign-execute-modal',
  standalone: true,
  imports: [ModalComponent, IconComponent],
  templateUrl: './campaign-execute-modal.component.html',
  styleUrl: './campaign-execute-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignExecuteModalComponent {
  readonly open = input.required<boolean>();
  readonly campaign = input.required<CampaignListItemState | null>();
  readonly results = input.required<ExecuteResult | null>();
  readonly closed = output<void>();
  readonly confirmed = output<void>();

  get confirmLabel(): string {
    return this.results() ? 'Done' : 'Send Notifications';
  }

  get showCancel(): boolean {
    return !this.results();
  }

  get confirmDisabled(): boolean {
    const c = this.campaign();
    return !c?.hasRequiredTemplates && !this.results();
  }

  onConfirm(): void {
    if (this.results()) {
      this.closed.emit();
    } else {
      this.confirmed.emit();
    }
  }
}
