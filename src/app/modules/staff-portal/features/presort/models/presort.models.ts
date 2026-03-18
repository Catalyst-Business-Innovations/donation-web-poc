import { ContainerDest, ContainerType, ItemCondition, PresortMethod } from '../../../../../core/models/domain.models';

export interface PresortQueueItem {
  id: number;
  barcode: string;
  /** Receipt number of linked donation visit */
  donationReceiptNumber?: string;
  /** Human-readable donor/source label */
  donorVisitLabel: string;
  containerType: ContainerType;
  presortMethod: PresortMethod;
  itemCount: number;
  /** ISO timestamp of when container was received */
  receivedAt: Date;
}

export interface PresortWorkItem {
  categoryKey: string;
  categoryName: string;
  icon: string;
  quantity: number;
  condition: ItemCondition;
  /** Items flagged for e-commerce within this category */
  ecommerceQty: number;
}

export interface PresortState {
  activeId: number | null;
  containerType: ContainerType;
  presortMethod: PresortMethod;
  items: PresortWorkItem[];
  destination: ContainerDest;
  isSeasonal: boolean;
  seasonalTag: string;
  ecommerce: boolean;
  salvageWeightLbs: number | null;
  notes: string;
}

export class PresortMapper {
  static empty(): PresortState {
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
}

/** Age helper used in template */
export function ageLabel(receivedAt: Date): string {
  const mins = Math.floor((Date.now() - receivedAt.getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m ago` : `${hrs}h ago`;
}

/** Returns 'green' | 'yellow' | 'orange' | 'red' based on wait time */
export function ageClass(receivedAt: Date): 'green' | 'yellow' | 'orange' | 'red' {
  const mins = Math.floor((Date.now() - receivedAt.getTime()) / 60000);
  if (mins < 30) return 'green';
  if (mins < 60) return 'yellow';
  if (mins < 180) return 'orange';
  return 'red';
}
