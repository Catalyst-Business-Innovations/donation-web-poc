import {
  ContainerDest,
  ContainerDestLabel,
  ContainerType,
  ItemCondition,
  PresortMethod,
  PresortMethodLabel
} from '@core/models/domain.models';
import { CONTAINER_TYPE_OPTIONS, ROUTE_OPTIONS, AgeColor, AgeSeverity, BacklogSeverity } from './presort.enum';
import {
  PresortQueueItemState,
  PresortWorkItemState,
  PresortFormState,
  PresortStatsState,
  PresortConfirmState,
  PresortQueueSummaryState,
  PresortCategoryOptionState
} from './presort.state';
import { PresortQueueResponse, PresortStatsResponse, PresortCategoryResponse } from './presort.response';
import { IconName } from '@shared/components/icon/icon.component';

// ── Age helpers ──────────────────────────────────────────────────────────────

export function computeAgeLabel(receivedAt: Date): string {
  const mins = Math.floor((Date.now() - receivedAt.getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m ago` : `${hrs}h ago`;
}

export function computeAgeColor(receivedAt: Date): AgeColor {
  const mins = Math.floor((Date.now() - receivedAt.getTime()) / 60000);
  if (mins < 30) return 'green';
  if (mins < 60) return 'yellow';
  if (mins < 180) return 'orange';
  return 'red';
}

// ── Backlog helpers ──────────────────────────────────────────────────────────

export function computeBacklogSeverity(count: number): BacklogSeverity {
  if (count <= 3) return 'ok';
  if (count <= 6) return 'warn';
  return 'danger';
}

// ── Oldest queue helpers ─────────────────────────────────────────────────────

export function computeOldestQueueLabel(queueItems: PresortQueueResponse[]): string {
  if (!queueItems.length) return '\u2014';
  const mins = Math.max(...queueItems.map(q => Math.floor((Date.now() - q.receivedAt.getTime()) / 60000)));
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  if (hrs === 0) return `${mins}m`;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

export function computeOldestQueueSeverity(queueItems: PresortQueueResponse[]): AgeSeverity {
  if (!queueItems.length) return 'ok';
  const mins = Math.max(...queueItems.map(q => Math.floor((Date.now() - q.receivedAt.getTime()) / 60000)));
  if (mins < 60) return 'ok';
  if (mins < 180) return 'warn';
  return 'danger';
}

// ── Container type helpers ───────────────────────────────────────────────────

export function containerTypeLabel(type: ContainerType): string {
  return CONTAINER_TYPE_OPTIONS.find(o => o.value === type)?.label ?? String(type);
}

export function containerTypeIcon(type: ContainerType): IconName {
  return CONTAINER_TYPE_OPTIONS.find(o => o.value === type)?.icon ?? 'box';
}

// ── Destination / condition helpers ──────────────────────────────────────────

export function destinationLabel(d: ContainerDest | null): string {
  return d != null ? (ContainerDestLabel[d] ?? String(d)) : 'TBD';
}

export function conditionBadgeClass(c: ItemCondition): string {
  switch (c) {
    case ItemCondition.Sellable:
      return 'badge-success';
    case ItemCondition.NeedsRefurbishment:
      return 'badge-warning';
    default:
      return 'badge-danger';
  }
}

export function isSalvageOrDispose(c: ItemCondition): boolean {
  return c === ItemCondition.Salvage || c === ItemCondition.Dispose;
}

// ── Mappers ──────────────────────────────────────────────────────────────────

export function mapQueueResponseToState(q: PresortQueueResponse): PresortQueueItemState {
  return {
    id: q.id,
    barcode: q.barcode,
    donationReceiptNumber: q.donationReceiptNumber,
    donorVisitLabel: q.donorVisitLabel,
    containerType: q.containerType,
    containerTypeLabel: containerTypeLabel(q.containerType),
    containerTypeIcon: containerTypeIcon(q.containerType),
    presortMethod: q.presortMethod,
    presortMethodLabel: PresortMethodLabel[q.presortMethod],
    isDockSide: q.presortMethod === PresortMethod.DockSide,
    itemCount: q.itemCount,
    receivedAt: q.receivedAt,
    ageLabel: computeAgeLabel(q.receivedAt),
    ageColor: computeAgeColor(q.receivedAt)
  };
}

export function mapStatsResponseToState(stats: PresortStatsResponse, queue: PresortQueueResponse[]): PresortStatsState {
  return {
    sortedToday: stats.sortedToday,
    itemsProcessed: stats.itemsProcessed,
    avgSortMinutes: stats.avgSortMinutes,
    salvageRate: stats.salvageRate,
    ecommerceItems: stats.ecommerceItems,
    oldestQueuedLabel: computeOldestQueueLabel(queue),
    oldestQueuedSeverity: computeOldestQueueSeverity(queue),
    deptVolume: stats.deptVolume
  };
}

export function mapCategoryToOption(cat: PresortCategoryResponse): PresortCategoryOptionState {
  return { key: cat.key, name: cat.name, icon: cat.icon };
}

export function createWorkItem(cat: PresortCategoryResponse): PresortWorkItemState {
  return {
    categoryKey: cat.key,
    categoryName: cat.name,
    icon: cat.icon,
    quantity: 1,
    condition: ItemCondition.Sellable,
    ecommerceQty: 0,
    isSalvageOrDispose: false,
    conditionBadgeClass: 'badge-success'
  };
}

export function updateWorkItemCondition(item: PresortWorkItemState, cond: ItemCondition): PresortWorkItemState {
  const salvage = isSalvageOrDispose(cond);
  return {
    ...item,
    condition: cond,
    isSalvageOrDispose: salvage,
    conditionBadgeClass: conditionBadgeClass(cond),
    ecommerceQty: salvage ? 0 : item.ecommerceQty
  };
}

export function emptyFormState(): PresortFormState {
  return {
    activeId: null,
    containerType: ContainerType.Gaylord,
    presortMethod: PresortMethod.Batch,
    items: [],
    destination: ContainerDest.Production,
    isSeasonal: false,
    seasonalTag: 'Hold for Christmas',
    ecommerce: false,
    salvageWeightLbs: null,
    notes: ''
  };
}

export function buildConfirmState(
  form: PresortFormState,
  queueItem: PresortQueueItemState | undefined
): PresortConfirmState {
  return {
    barcode: queueItem?.barcode ?? '',
    donorVisitLabel: queueItem?.donorVisitLabel ?? '',
    containerTypeLabel: containerTypeLabel(form.containerType),
    destinationLabel: destinationLabel(form.destination),
    totalItemCount: form.items.reduce((s, i) => s + i.quantity, 0),
    categoryCount: form.items.length,
    isSeasonal: form.isSeasonal,
    seasonalTag: form.seasonalTag,
    ecommerce: form.ecommerce,
    salvageWeightLbs: form.salvageWeightLbs,
    items: form.items
  };
}

export function buildQueueSummary(count: number): PresortQueueSummaryState {
  return {
    count,
    backlogSeverity: computeBacklogSeverity(count)
  };
}

export function computeTotalItemCount(items: PresortWorkItemState[]): number {
  return items.reduce((s, i) => s + i.quantity, 0);
}

export function computeSalvageItemCount(items: PresortWorkItemState[]): number {
  return items.filter(i => i.isSalvageOrDispose).reduce((s, i) => s + i.quantity, 0);
}

export function hasSalvageItems(items: PresortWorkItemState[]): boolean {
  return items.some(i => i.isSalvageOrDispose);
}
