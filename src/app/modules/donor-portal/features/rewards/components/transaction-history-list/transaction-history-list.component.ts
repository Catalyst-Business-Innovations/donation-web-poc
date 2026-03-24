import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { IconComponent } from '@shared/components/icon/icon.component';
import { RewardTransactionState } from '../../models/rewards.state';

@Component({
  selector: 'app-transaction-history-list',
  standalone: true,
  imports: [DecimalPipe, DatePipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transaction-history-list.component.html',
  styleUrl: './transaction-history-list.component.scss',
})
export class TransactionHistoryListComponent {
  transactions = input.required<RewardTransactionState[]>();
}
