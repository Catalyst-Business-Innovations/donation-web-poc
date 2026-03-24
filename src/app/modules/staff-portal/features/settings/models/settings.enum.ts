import { RedemptionStatus } from '@core/models/domain.models';

export type SettingsTab = 'general' | 'loyalty' | 'rewards';

export type RewardFilterStatus = 'all' | 'active' | 'inactive';

export type RewardModalMode = 'add-reward' | 'edit-reward' | null;

export const RedemptionStatusBadgeClass: Record<RedemptionStatus, string> = {
  [RedemptionStatus.Pending]: 'badge-warning',
  [RedemptionStatus.Approved]: 'badge-info',
  [RedemptionStatus.Rejected]: 'badge-danger',
  [RedemptionStatus.Fulfilled]: 'badge-success',
  [RedemptionStatus.Cancelled]: 'badge-gray'
};
