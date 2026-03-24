import {
  ContainerStatus,
  ContainerDest,
  ContainerStatusLabel,
  ContainerDestLabel,
  ContainerTypeLabel,
  ItemConditionLabel
} from '@core/models/domain.models';
import { IconName } from '@shared/components/icon/icon.component';
import {
  StatusBadgeClass,
  DestBadgeClass,
  ConditionBadgeClass,
  CONTAINER_CAPACITY,
  NEXT_STATUS_MAP,
  NEXT_STATUS_LABEL
} from './containers.enum';
import { ContainerResponse } from './containers.response';
import {
  ContainerRowState,
  ContainerDetailState,
  ContainerContentState,
  TimelineStepState,
  PipelineStageState
} from './containers.state';

const DEST_ICON_MAP: Record<ContainerDest, IconName> = {
  [ContainerDest.Production]: 'settings',
  [ContainerDest.Reserve]: 'package',
  [ContainerDest.Warehouse]: 'building',
  [ContainerDest.Ecommerce]: 'grid',
  [ContainerDest.Salvage]: 'refresh',
  [ContainerDest.Transfer]: 'arrow-right'
};

export function statusLabel(s: ContainerStatus): string {
  return ContainerStatusLabel[s] ?? String(s);
}

export function statusBadgeClass(s: ContainerStatus): string {
  return StatusBadgeClass[s] ?? 'badge-gray';
}

export function destLabel(d: ContainerDest): string {
  return ContainerDestLabel[d] ?? String(d);
}

export function destIcon(d: ContainerDest): IconName {
  return DEST_ICON_MAP[d] ?? 'map-pin';
}

export function destBadgeClass(d: ContainerDest): string {
  return DestBadgeClass[d] ?? 'badge-gray';
}

export function condLabel(c: number): string {
  return ItemConditionLabel[c as keyof typeof ItemConditionLabel] ?? String(c);
}

export function condBadgeClass(c: number): string {
  return ConditionBadgeClass[c as keyof typeof ConditionBadgeClass] ?? 'badge-gray';
}

export function fillPct(totalItems: number, containerType: number): number {
  const cap = CONTAINER_CAPACITY[containerType as keyof typeof CONTAINER_CAPACITY];
  if (!cap) return 0;
  return Math.min(100, Math.round((totalItems / cap) * 100));
}

export function nextStatus(s: ContainerStatus): ContainerStatus | null {
  return NEXT_STATUS_MAP[s] ?? null;
}

export function nextStatusLbl(s: ContainerStatus): string {
  return NEXT_STATUS_LABEL[s] ?? '';
}

export function mapContainerToRow(c: ContainerResponse): ContainerRowState {
  const cap = CONTAINER_CAPACITY[c.containerType] ?? 0;
  const pct = fillPct(c.totalItems, c.containerType);
  const ns = nextStatus(c.status);

  return {
    id: c.id,
    barcode: c.barcode,
    donorVisitLabel: c.donorVisitLabel ?? null,
    containerType: c.containerType,
    typeLabel: ContainerTypeLabel[c.containerType] ?? String(c.containerType),
    deptName: c.deptName ?? null,
    catName: c.catName ?? null,
    status: c.status,
    statusLabel: statusLabel(c.status),
    statusBadgeClass: statusBadgeClass(c.status),
    destination: c.destination ?? null,
    destLabel: c.destination ? destLabel(c.destination) : null,
    destBadgeClass: c.destination ? destBadgeClass(c.destination) : null,
    destIcon: c.destination ? destIcon(c.destination) : null,
    transferToLocationName: c.transferToLocationName ?? null,
    totalItems: c.totalItems,
    capacity: cap,
    fillPct: pct,
    updatedAt: c.updatedAt,
    nextStatus: ns,
    nextStatusLabel: ns ? nextStatusLbl(c.status) : ''
  };
}

export function mapContainerToDetail(c: ContainerResponse): ContainerDetailState {
  const cap = CONTAINER_CAPACITY[c.containerType] ?? 0;
  const pct = fillPct(c.totalItems, c.containerType);
  const ns = nextStatus(c.status);

  return {
    id: c.id,
    barcode: c.barcode,
    containerType: c.containerType,
    typeLabel: ContainerTypeLabel[c.containerType] ?? String(c.containerType),
    deptName: c.deptName ?? null,
    catName: c.catName ?? null,
    status: c.status,
    statusLabel: statusLabel(c.status),
    statusBadgeClass: statusBadgeClass(c.status),
    destination: c.destination ?? null,
    destLabel: c.destination ? destLabel(c.destination) : null,
    destBadgeClass: c.destination ? destBadgeClass(c.destination) : null,
    totalItems: c.totalItems,
    capacity: cap,
    fillPct: pct,
    locationName: c.locationName,
    salvageWeightLbs: c.salvageWeightLbs ?? null,
    presortWorkerName: c.presortWorkerName ?? null,
    transferToLocationName: c.transferToLocationName ?? null,
    notes: c.notes ?? null,
    contents: mapContents(c),
    timeline: buildTimeline(c),
    nextStatus: ns,
    nextStatusLabel: ns ? nextStatusLbl(c.status) : '',
    canReset: c.status !== ContainerStatus.Available
  };
}

function mapContents(c: ContainerResponse): ContainerContentState[] {
  return c.contents.map(item => ({
    categoryKey: item.categoryKey,
    categoryName: item.categoryName,
    quantity: item.quantity,
    conditionLabel: condLabel(item.condition),
    conditionBadgeClass: condBadgeClass(item.condition),
    ecommerceQty: item.ecommerceQty ?? null
  }));
}

function buildTimeline(c: ContainerResponse): TimelineStepState[] {
  return [
    {
      label: 'Available',
      time: c.createdAt,
      done: true,
      icon: 'download' as IconName
    },
    {
      label: 'In Use',
      time: undefined,
      done: [ContainerStatus.InUse, ContainerStatus.ReadyForSorting, ContainerStatus.Sorting].includes(c.status),
      icon: 'settings' as IconName
    },
    {
      label: 'Ready for Sorting',
      time: undefined,
      done: [ContainerStatus.ReadyForSorting, ContainerStatus.Sorting].includes(c.status),
      icon: 'clock' as IconName
    },
    {
      label: 'Sorting',
      time: c.presortedAt,
      done: c.status === ContainerStatus.Sorting,
      icon: 'list' as IconName
    }
  ];
}

export function computePipeline(containers: ContainerResponse[]): PipelineStageState[] {
  const n = (s: ContainerStatus) => containers.filter(c => c.status === s).length;
  return [
    {
      status: ContainerStatus.Available,
      icon: 'download' as IconName,
      label: 'Available',
      count: n(ContainerStatus.Available)
    },
    { status: ContainerStatus.InUse, icon: 'settings' as IconName, label: 'In Use', count: n(ContainerStatus.InUse) },
    {
      status: ContainerStatus.ReadyForSorting,
      icon: 'clock' as IconName,
      label: 'Ready for Sorting',
      count: n(ContainerStatus.ReadyForSorting)
    },
    { status: ContainerStatus.Sorting, icon: 'list' as IconName, label: 'Sorting', count: n(ContainerStatus.Sorting) }
  ];
}

export function mapContainerToEditInfo(c: ContainerResponse) {
  return {
    barcode: c.barcode,
    typeLabel: ContainerTypeLabel[c.containerType] ?? String(c.containerType),
    deptName: c.deptName ?? null,
    catName: c.catName ?? null,
    totalItems: c.totalItems,
    locationName: c.locationName,
    salvageWeightLbs: c.salvageWeightLbs ?? null,
    presortedAt: c.presortedAt ?? null
  };
}
