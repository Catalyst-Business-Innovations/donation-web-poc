import { ContainerDest, ContainerType, ItemCondition } from '@core/models/domain.models';
import { IconName } from '@shared/components/icon/icon.component';

export type BacklogSeverity = 'ok' | 'warn' | 'danger';
export type AgeSeverity = 'ok' | 'warn' | 'danger';
export type AgeColor = 'green' | 'yellow' | 'orange' | 'red';

export const CONTAINER_TYPE_OPTIONS: { value: ContainerType; icon: IconName; label: string }[] = [
  { value: ContainerType.Gaylord, icon: 'box', label: 'Gaylord' },
  { value: ContainerType.CartRack, icon: 'layers', label: 'Cart / Rack' },
  { value: ContainerType.Pallet, icon: 'package', label: 'Pallet' },
  { value: ContainerType.Tote, icon: 'package', label: 'Tote / Bin' },
  { value: ContainerType.Baler, icon: 'refresh', label: 'Baler Bin' }
];

export const ROUTE_OPTIONS: { value: ContainerDest; icon: IconName; label: string }[] = [
  { value: ContainerDest.Production, icon: 'settings', label: 'Production' },
  { value: ContainerDest.Reserve, icon: 'package', label: 'Reserve' },
  { value: ContainerDest.Warehouse, icon: 'building', label: 'Warehouse' },
  { value: ContainerDest.Ecommerce, icon: 'grid', label: 'E-Commerce' },
  { value: ContainerDest.Salvage, icon: 'refresh', label: 'Salvage' }
];

export const CONDITION_OPTIONS: { value: ItemCondition; label: string }[] = [
  { value: ItemCondition.Sellable, label: 'Sellable' },
  { value: ItemCondition.NeedsRefurbishment, label: 'Needs Refurb' },
  { value: ItemCondition.Salvage, label: 'Salvage' },
  { value: ItemCondition.Dispose, label: 'Dispose' }
];

export const SEASONAL_TAGS: string[] = [
  'Hold for Christmas',
  'Hold for Halloween',
  'Hold for Easter',
  'Hold for Summer',
  'Hold for Back-to-School'
];
