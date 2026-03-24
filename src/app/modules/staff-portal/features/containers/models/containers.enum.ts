import { ContainerStatus, ContainerDest, ContainerType, ItemCondition } from '@core/models/domain.models';

export const StatusBadgeClass: Record<ContainerStatus, string> = {
  [ContainerStatus.Available]: 'badge-success',
  [ContainerStatus.ReadyForSorting]: 'badge-info',
  [ContainerStatus.Sorting]: 'badge-warning',
  [ContainerStatus.InUse]: 'badge-purple'
};

export const DestBadgeClass: Record<ContainerDest, string> = {
  [ContainerDest.Production]: 'badge-success',
  [ContainerDest.Reserve]: 'badge-info',
  [ContainerDest.Warehouse]: 'badge-purple',
  [ContainerDest.Ecommerce]: 'badge-warning',
  [ContainerDest.Salvage]: 'badge-danger',
  [ContainerDest.Transfer]: 'badge-gray'
};

export const ConditionBadgeClass: Record<ItemCondition, string> = {
  [ItemCondition.Sellable]: 'badge-success',
  [ItemCondition.NeedsRefurbishment]: 'badge-warning',
  [ItemCondition.Salvage]: 'badge-danger',
  [ItemCondition.Dispose]: 'badge-danger'
};

export const CONTAINER_CAPACITY: Record<ContainerType, number> = {
  [ContainerType.Gaylord]: 400,
  [ContainerType.CartRack]: 80,
  [ContainerType.Pallet]: 200,
  [ContainerType.Tote]: 50,
  [ContainerType.Baler]: 0
};

export const NEXT_STATUS_MAP: Partial<Record<ContainerStatus, ContainerStatus>> = {
  [ContainerStatus.Available]: ContainerStatus.InUse,
  [ContainerStatus.InUse]: ContainerStatus.ReadyForSorting,
  [ContainerStatus.ReadyForSorting]: ContainerStatus.Sorting,
  [ContainerStatus.Sorting]: ContainerStatus.Available
};

export const NEXT_STATUS_LABEL: Partial<Record<ContainerStatus, string>> = {
  [ContainerStatus.Available]: 'Mark In Use',
  [ContainerStatus.InUse]: 'Queue for Sorting',
  [ContainerStatus.ReadyForSorting]: 'Start Sorting',
  [ContainerStatus.Sorting]: 'Mark Available'
};
