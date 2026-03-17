import { Injectable, computed, signal } from '@angular/core';
import { MockDataService } from '../../../../../core/services/mock-data.service';
import { NewDonationState, SelectedDonor, WizardStep } from '../models/new-donation.state';
import { NewDonationMapper } from '../models/new-donation.mapper';
import { DonationType, ReceiptDelivery } from '../../../../../core/models/domain.models';

@Injectable({ providedIn: 'root' })
export class NewDonationStateService {
  private _state = signal<NewDonationState>({
    step: 1,
    donationType: null,
    donor: undefined,
    selectedItems: {},
    monetaryAmount: null,
    receiptDelivery: ReceiptDelivery.Email,
    isPreSorted: false,
    notes: ''
  });

  readonly state = this._state.asReadonly();
  readonly step = computed(() => this._state().step);
  readonly donor = computed(() => this._state().donor);
  readonly donationType = computed(() => this._state().donationType);
  readonly selectedItems = computed(() => this._state().selectedItems);
  readonly isPreSorted = computed(() => this._state().isPreSorted);
  readonly totalItems = computed(() => NewDonationMapper.totalItems(this._state().selectedItems));
  readonly totalValue = computed(() => NewDonationMapper.totalValue(this._state().selectedItems, this.data.departments));
  readonly estPoints = computed(() => NewDonationMapper.estimatedPoints(this.totalValue()));

  constructor(private data: MockDataService) {}

  setDonor(d: SelectedDonor | null | undefined): void {
    this._state.update(s => ({ ...s, donor: d }));
  }
  setDonationType(t: DonationType): void {
    this._state.update(s => ({
      ...s,
      donationType: t,
      // Clear items when switching to monetary-only so review is clean
      selectedItems: t === DonationType.Monetary ? {} : s.selectedItems
    }));
  }
  nextStep(): void {
    this._state.update(s => {
      const maxStep = s.donationType === DonationType.Both ? 5 : 4;
      const next = Math.min(maxStep, (s.step as number) + 1) as WizardStep;
      return { ...s, step: next };
    });
  }
  prevStep(): void {
    this._state.update(s => {
      const prev = Math.max(1, (s.step as number) - 1) as WizardStep;
      return { ...s, step: prev };
    });
  }

  setQty(key: string, delta: number): void {
    this._state.update(s => {
      const items = { ...s.selectedItems };
      const next = Math.max(0, (items[key]?.qty ?? 0) + delta);
      if (next === 0) {
        delete items[key];
      } else {
        items[key] = { ...items[key], qty: next };
      }
      return { ...s, selectedItems: items };
    });
  }

  setItemValue(key: string, value: number): void {
    this._state.update(s => {
      const items = { ...s.selectedItems };
      if (items[key]) items[key] = { ...items[key], estimatedValue: value };
      return { ...s, selectedItems: items };
    });
  }

  setPreSorted(v: boolean): void {
    this._state.update(s => ({ ...s, isPreSorted: v }));
  }

  goToStep(step: WizardStep): void {
    this._state.update(s => ({ ...s, step }));
  }

  reset(): void {
    this._state.set({
      step: 1,
      donationType: null,
      donor: undefined,
      selectedItems: {},
      monetaryAmount: null,
      receiptDelivery: ReceiptDelivery.Email,
      isPreSorted: false,
      notes: ''
    });
  }
}
