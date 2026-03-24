import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IconComponent } from '@shared/components/icon/icon.component';
import { DonationHistoryItemState } from '../../models/history.state';

@Component({
  selector: 'app-history-list',
  standalone: true,
  imports: [DatePipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './history-list.component.html',
  styleUrl: './history-list.component.scss',
})
export class HistoryListComponent {
  donations = input.required<DonationHistoryItemState[]>();
  expandedId = input.required<number | null>();
  toggled = output<number>();
  downloadRequested = output<number>();
}
