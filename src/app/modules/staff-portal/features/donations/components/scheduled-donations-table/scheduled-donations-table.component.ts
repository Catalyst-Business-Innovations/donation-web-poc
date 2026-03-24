import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ScheduledDonationState } from '../../models/donations.state';
import { DonationStatus } from '@core/models/domain.models';

@Component({
  selector: 'app-scheduled-donations-table',
  standalone: true,
  imports: [DatePipe, IconComponent],
  templateUrl: './scheduled-donations-table.component.html',
  styleUrl: './scheduled-donations-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScheduledDonationsTableComponent {
  readonly donations = input.required<ScheduledDonationState[]>();
  readonly viewRequested = output<number>();
  readonly cancelRequested = output<number>();

  protected readonly AS = DonationStatus;
}
