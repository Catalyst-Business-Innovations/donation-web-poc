import { RedemptionStatus } from '@core/models/domain.models';

export const RedemptionStatusBadgeClass: Record<RedemptionStatus, string> = {
  [RedemptionStatus.Pending]: 'badge-warning',
  [RedemptionStatus.Approved]: 'badge-info',
  [RedemptionStatus.Rejected]: 'badge-danger',
  [RedemptionStatus.Fulfilled]: 'badge-success',
  [RedemptionStatus.Cancelled]: 'badge-gray'
};

export type GiftStep = 'search' | 'confirm';
