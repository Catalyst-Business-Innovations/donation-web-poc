import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { IconComponent } from '@shared/components/icon/icon.component';
import { CompletedDonationState } from '../../models/donations.state';

@Component({
  selector: 'app-completed-donations-table',
  standalone: true,
  imports: [DatePipe, DecimalPipe, IconComponent],
  templateUrl: './completed-donations-table.component.html',
  styleUrl: './completed-donations-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompletedDonationsTableComponent {
  readonly donations = input.required<CompletedDonationState[]>();
  readonly linkRequested = output<number>();
}
