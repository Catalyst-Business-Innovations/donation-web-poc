import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RecentDonationState } from '../../models/admin-dashboard.state';

@Component({
  selector: 'app-recent-donations-table',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './recent-donations-table.component.html',
  styleUrl: './recent-donations-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecentDonationsTableComponent {
  readonly donations = input.required<RecentDonationState[]>();
}
