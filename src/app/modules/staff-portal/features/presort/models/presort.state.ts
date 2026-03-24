import { ContainerDest, ContainerType, ItemCondition, PresortMethod } from '@core/models/domain.models';
import { IconName } from '@shared/components/icon/icon.component';
import { AgeColor, AgeSeverity, BacklogSeverity } from './presort.enum';

export interface PresortQueueItemState {
  id: number;
  barcode: string;
  donationReceiptNumber?: string;
  donorVisitLabel: string;
  containerType: ContainerType;
  containerTypeLabel: string;
  containerTypeIcon: IconName;
  presortMethod: PresortMethod;
  presortMethodLabel: string;
  isDockSide: boolean;
  itemCount: number;
  receivedAt: Date;
  ageLabel: string;
  ageColor: AgeColor;
}

export interface PresortWorkItemState {
  categoryKey: string;
  categoryName: string;
  icon: string;
  quantity: number;
  condition: ItemCondition;
  ecommerceQty: number;
  isSalvageOrDispose: boolean;
  conditionBadgeClass: string;
}

export interface PresortFormState {
  activeId: number | null;
  containerType: ContainerType;
  presortMethod: PresortMethod;
  items: PresortWorkItemState[];
  destination: ContainerDest;
  isSeasonal: boolean;
  seasonalTag: string;
  ecommerce: boolean;
  salvageWeightLbs: number | null;
  notes: string;
}

export interface PresortStatsState {
  sortedToday: number;
  itemsProcessed: number;
  avgSortMinutes: number;
  salvageRate: number;
  ecommerceItems: number;
  oldestQueuedLabel: string;
  oldestQueuedSeverity: AgeSeverity;
  deptVolume: { name: string; pct: number; color: string }[];
}

export interface PresortConfirmState {
  barcode: string;
  donorVisitLabel: string;
  containerTypeLabel: string;
  destinationLabel: string;
  totalItemCount: number;
  categoryCount: number;
  isSeasonal: boolean;
  seasonalTag: string;
  ecommerce: boolean;
  salvageWeightLbs: number | null;
  items: PresortWorkItemState[];
}

export interface PresortQueueSummaryState {
  count: number;
  backlogSeverity: BacklogSeverity;
}

export interface PresortCategoryOptionState {
  key: string;
  name: string;
  icon: string;
}
