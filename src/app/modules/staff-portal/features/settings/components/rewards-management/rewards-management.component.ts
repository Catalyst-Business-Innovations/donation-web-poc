import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { IconComponent } from '@shared/components/icon/icon.component';
import { RewardType } from '@core/models/domain.models';
import { RewardDefinitionState, RewardTransactionState, RewardTypeOption } from '../../models/settings.state';
import { RewardFilterStatus } from '../../models/settings.enum';

@Component({
  selector: 'app-rewards-management',
  standalone: true,
  imports: [FormsModule, DecimalPipe, DatePipe, IconComponent],
  templateUrl: './rewards-management.component.html',
  styleUrl: './rewards-management.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RewardsManagementComponent {
  readonly rewards = input.required<RewardDefinitionState[]>();
  readonly transactions = input.required<RewardTransactionState[]>();
  readonly rewardTypes = input.required<RewardTypeOption[]>();
  readonly statusFilter = input.required<RewardFilterStatus>();
  readonly typeFilter = input.required<RewardType | 0>();

  readonly addReward = output<void>();
  readonly editReward = output<RewardDefinitionState>();
  readonly toggleActive = output<RewardDefinitionState>();
  readonly deleteReward = output<RewardDefinitionState>();
  readonly statusFilterChanged = output<RewardFilterStatus>();
  readonly typeFilterChanged = output<RewardType | 0>();
  readonly approveRedemption = output<number>();
  readonly rejectRedemption = output<number>();
  readonly fulfillRedemption = output<number>();
  readonly cancelRedemption = output<number>();

  protected onTypeFilterChange(value: string): void {
    this.typeFilterChanged.emit(+value as RewardType | 0);
  }
}
