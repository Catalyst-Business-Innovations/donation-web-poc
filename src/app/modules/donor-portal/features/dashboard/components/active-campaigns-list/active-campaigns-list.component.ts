import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IconComponent } from '@shared/components/icon/icon.component';
import { CampaignSummaryState } from '../../models/dashboard.state';

@Component({
  selector: 'app-active-campaigns-list',
  standalone: true,
  imports: [DatePipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './active-campaigns-list.component.html',
  styleUrl: './active-campaigns-list.component.scss'
})
export class ActiveCampaignsListComponent {
  campaigns = input.required<CampaignSummaryState[]>();
}
