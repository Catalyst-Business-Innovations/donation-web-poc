import { IconName } from '@shared/components/icon/icon.component';
import { ContainerStatus, ContainerDest, ContainerType, ContainerContent } from '@core/models/domain.models';

export interface ContainerRowState {
  id: number;
  barcode: string;
  donorVisitLabel: string | null;
  containerType: ContainerType;
  typeLabel: string;
  deptName: string | null;
  catName: string | null;
  status: ContainerStatus;
  statusLabel: string;
  statusBadgeClass: string;
  destination: ContainerDest | null;
  destLabel: string | null;
  destBadgeClass: string | null;
  destIcon: IconName | null;
  transferToLocationName: string | null;
  totalItems: number;
  capacity: number;
  fillPct: number;
  updatedAt: Date;
  nextStatus: ContainerStatus | null;
  nextStatusLabel: string;
}

export interface ContainerDetailState {
  id: number;
  barcode: string;
  containerType: ContainerType;
  typeLabel: string;
  deptName: string | null;
  catName: string | null;
  status: ContainerStatus;
  statusLabel: string;
  statusBadgeClass: string;
  destination: ContainerDest | null;
  destLabel: string | null;
  destBadgeClass: string | null;
  totalItems: number;
  capacity: number;
  fillPct: number;
  locationName: string;
  salvageWeightLbs: number | null;
  presortWorkerName: string | null;
  transferToLocationName: string | null;
  notes: string | null;
  contents: ContainerContentState[];
  timeline: TimelineStepState[];
  nextStatus: ContainerStatus | null;
  nextStatusLabel: string;
  canReset: boolean;
}

export interface ContainerContentState {
  categoryKey: string;
  categoryName: string;
  quantity: number;
  conditionLabel: string;
  conditionBadgeClass: string;
  ecommerceQty: number | null;
}

export interface TimelineStepState {
  label: string;
  time: Date | undefined;
  done: boolean;
  icon: IconName;
}

export interface PipelineStageState {
  status: ContainerStatus;
  icon: IconName;
  label: string;
  count: number;
}

export interface ContainerFormState {
  containerType: ContainerType;
  status: ContainerStatus;
  deptKey: string;
  catKey: string;
  destination: ContainerDest | null;
  transferToLocationId: number | null;
  salvageWeight: string;
  notes: string;
}

export interface ContainerEditState {
  status: ContainerStatus;
  destination: ContainerDest | null;
  transferToLocationId: number | null;
  notes: string;
}

export interface ContainerEditInfoState {
  barcode: string;
  typeLabel: string;
  deptName: string | null;
  catName: string | null;
  totalItems: number;
  locationName: string;
  salvageWeightLbs: number | null;
  presortedAt: Date | null;
}

export interface MergeFormState {
  containerType: ContainerType;
  deptKey: string;
  catKey: string;
  destination: ContainerDest | null;
  transferToLocationId: number | null;
  notes: string;
}

export interface DepartmentOption {
  key: string;
  name: string;
}

export interface CategoryOption {
  key: string;
  name: string;
}

export interface LocationOption {
  id: number;
  name: string;
}
