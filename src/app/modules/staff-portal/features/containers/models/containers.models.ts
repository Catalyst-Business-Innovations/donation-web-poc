import {
  ContainerDest, ContainerStatus, ItemCondition,
  ContainerStatusLabel, ContainerDestLabel, ItemConditionLabel
} from '../../../../../core/models/domain.models';
import { IconName } from '../../../../../shared/components/icon/icon.component';

export class ContainersMapper {
  static statusLabel(s: ContainerStatus): string {
    return ContainerStatusLabel[s] ?? String(s);
  }
  static statusBadge(s: ContainerStatus): string {
    const m: Record<ContainerStatus, string> = {
      [ContainerStatus.Available]: 'badge-success',
      [ContainerStatus.ReadyForSorting]: 'badge-info',
      [ContainerStatus.Sorting]: 'badge-warning',
      [ContainerStatus.InUse]: 'badge-purple',
    };
    return m[s] ?? 'badge-gray';
  }
  static destLabel(d: ContainerDest): string {
    return ContainerDestLabel[d] ?? String(d);
  }
  static destIcon(d: ContainerDest): IconName {
    const m: Record<ContainerDest, IconName> = {
      [ContainerDest.Production]: 'settings',
      [ContainerDest.Reserve]: 'package',
      [ContainerDest.Warehouse]: 'building',
      [ContainerDest.Ecommerce]: 'grid',
      [ContainerDest.Salvage]: 'refresh',
      [ContainerDest.Transfer]: 'arrow-right',
    };
    return m[d] ?? 'map-pin';
  }
  static destBadge(d: ContainerDest): string {
    const m: Record<ContainerDest, string> = {
      [ContainerDest.Production]: 'badge-success',
      [ContainerDest.Reserve]: 'badge-info',
      [ContainerDest.Warehouse]: 'badge-purple',
      [ContainerDest.Ecommerce]: 'badge-warning',
      [ContainerDest.Salvage]: 'badge-danger',
      [ContainerDest.Transfer]: 'badge-gray',
    };
    return m[d] ?? 'badge-gray';
  }
  static condLabel(c: ItemCondition): string {
    return ItemConditionLabel[c] ?? String(c);
  }
  static condBadge(c: ItemCondition): string {
    const m: Record<ItemCondition, string> = {
      [ItemCondition.Sellable]: 'badge-success',
      [ItemCondition.NeedsRefurbishment]: 'badge-warning',
      [ItemCondition.Salvage]: 'badge-danger',
      [ItemCondition.Dispose]: 'badge-danger',
    };
    return m[c] ?? 'badge-gray';
  }
}
