import { ContainerDest, ContainerType, ItemCondition, PresortMethod } from '@core/models/domain.models';

export interface PresortQueueResponse {
  id: number;
  barcode: string;
  donationReceiptNumber?: string;
  donorVisitLabel: string;
  containerType: ContainerType;
  presortMethod: PresortMethod;
  itemCount: number;
  receivedAt: Date;
}

export interface PresortStatsResponse {
  sortedToday: number;
  itemsProcessed: number;
  avgSortMinutes: number;
  salvageRate: number;
  ecommerceItems: number;
  oldestQueuedMins: number;
  deptVolume: { name: string; pct: number; color: string }[];
}

export interface PresortCategoryResponse {
  key: string;
  name: string;
  icon: string;
}

export interface PresortContainerUpdateResponse {
  success: boolean;
  barcode: string;
}

export interface PresortSplitResponse {
  success: boolean;
  newBarcodes: string[];
}
