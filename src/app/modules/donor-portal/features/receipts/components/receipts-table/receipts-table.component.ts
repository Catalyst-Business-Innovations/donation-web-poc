import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ReceiptListItemState } from '../../models/receipts.state';

@Component({
  selector: 'app-receipts-table',
  standalone: true,
  imports: [DatePipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './receipts-table.component.html',
  styleUrl: './receipts-table.component.scss'
})
export class ReceiptsTableComponent {
  receipts = input.required<ReceiptListItemState[]>();
  viewRequested = output<number>();
  downloadRequested = output<number>();
  emailRequested = output<number>();
}
