import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IconComponent } from '@shared/components/icon/icon.component';
import { CampaignListItemState } from '../../models/campaigns.state';
import { criterionLabel } from '../../models/campaigns.mapper';
import { CampaignTargetCriteria } from '@core/models/domain.models';

@Component({
  selector: 'app-campaign-table',
  standalone: true,
  imports: [DatePipe, IconComponent],
  templateUrl: './campaign-table.component.html',
  styleUrl: './campaign-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignTableComponent {
  readonly campaigns = input.required<CampaignListItemState[]>();
  readonly viewClicked = output<CampaignListItemState>();
  readonly editClicked = output<CampaignListItemState>();
  readonly activateClicked = output<CampaignListItemState>();
  readonly pauseClicked = output<CampaignListItemState>();
  readonly executeClicked = output<CampaignListItemState>();

  getCriterionLabel(c: CampaignTargetCriteria): string {
    return criterionLabel(c);
  }
}
