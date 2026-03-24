import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DonationCountsState } from '../../models/donations.state';
import { DonationStatus } from '@core/models/domain.models';

@Component({
  selector: 'app-donation-status-counts',
  standalone: true,
  templateUrl: './donation-status-counts.component.html',
  styleUrl: './donation-status-counts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DonationStatusCountsComponent {
  readonly counts = input.required<DonationCountsState>();
  readonly activeStatus = input.required<DonationStatus | ''>();
  readonly statusClicked = output<DonationStatus | ''>();

  protected readonly DS = DonationStatus;
}
