import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CampaignStatus } from '@core/models/domain.models';
import { CampaignStatusCounts } from '../../models/campaigns.state';

@Component({
  selector: 'app-campaign-status-counts',
  standalone: true,
  templateUrl: './campaign-status-counts.component.html',
  styleUrl: './campaign-status-counts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignStatusCountsComponent {
  readonly counts = input.required<CampaignStatusCounts>();
  readonly activeFilter = input.required<CampaignStatus | ''>();
  readonly filterChanged = output<CampaignStatus | ''>();

  protected readonly CS = CampaignStatus;

  toggleFilter(status: CampaignStatus): void {
    this.filterChanged.emit(this.activeFilter() === status ? '' : status);
  }
}
