import { Injectable, inject } from '@angular/core';
import { MockDataService } from '@core/services/mock-data.service';
import { ContainerDest, ContainerStatus } from '@core/models/domain.models';
import {
  PresortQueueItemState,
  PresortFormState,
  PresortStatsState,
  PresortQueueSummaryState,
  PresortCategoryOptionState,
  PresortWorkItemState
} from '../models/presort.state';
import { PresortQueueResponse } from '../models/presort.response';
import {
  mapQueueResponseToState,
  mapStatsResponseToState,
  mapCategoryToOption,
  createWorkItem,
  emptyFormState,
  buildQueueSummary,
  destinationLabel,
  computeTotalItemCount
} from '../models/presort.mapper';

@Injectable({ providedIn: 'root' })
export class PresortService {
  private readonly mockData = inject(MockDataService);

  getQueue(): PresortQueueItemState[] {
    const raw: PresortQueueResponse[] = this.mockData.presortQueue;
    return raw.map(mapQueueResponseToState);
  }

  getQueueSummary(): PresortQueueSummaryState {
    return buildQueueSummary(this.mockData.presortQueue.length);
  }

  getStats(): PresortStatsState {
    const raw = this.mockData.getPresortStats();
    const queue: PresortQueueResponse[] = this.mockData.presortQueue;
    return mapStatsResponseToState(raw, queue);
  }

  getCategories(): PresortCategoryOptionState[] {
    return this.mockData.categories.map(mapCategoryToOption);
  }

  buildInitialFormState(queueItem: PresortQueueItemState): PresortFormState {
    const base = emptyFormState();
    return {
      ...base,
      activeId: queueItem.id,
      containerType: queueItem.containerType,
      presortMethod: queueItem.presortMethod,
      items: [
        { ...createWorkItem({ key: 'clothing', name: 'Clothing', icon: '\uD83D\uDC54' }), quantity: 12 },
        { ...createWorkItem({ key: 'shoes', name: 'Shoes', icon: '\uD83D\uDC5F' }), quantity: 6 },
        { ...createWorkItem({ key: 'books', name: 'Books & Media', icon: '\uD83D\uDCDA' }), quantity: 8 }
      ]
    };
  }

  findCategory(key: string): PresortCategoryOptionState | undefined {
    const cat = this.mockData.categories.find(c => c.key === key);
    return cat ? mapCategoryToOption(cat) : undefined;
  }

  completeContainer(id: number, form: PresortFormState): { barcode: string; destLabel: string } {
    const qItem = this.mockData.presortQueue.find(q => q.id === id);
    this.mockData.updateContainer(id, {
      presortMethod: form.presortMethod,
      presortWorkerName: this.mockData.session.staffName,
      contents: form.items.map(i => ({
        categoryKey: i.categoryKey,
        categoryName: i.categoryName,
        quantity: i.quantity,
        condition: i.condition,
        ecommerceQty: i.ecommerceQty > 0 ? i.ecommerceQty : undefined
      })),
      destination: form.destination,
      status: ContainerStatus.Sorting,
      totalItems: computeTotalItemCount(form.items),
      salvageWeightLbs: form.salvageWeightLbs ?? undefined,
      isSeasonal: form.isSeasonal,
      seasonalTag: form.isSeasonal ? form.seasonalTag : undefined,
      notes: form.notes || undefined,
      presortedAt: new Date()
    });
    return {
      barcode: qItem?.barcode ?? String(id),
      destLabel: destinationLabel(form.destination)
    };
  }

  quickComplete(id: number): string {
    const qItem = this.mockData.presortQueue.find(q => q.id === id);
    this.mockData.updateContainer(id, {
      status: ContainerStatus.Sorting,
      destination: ContainerDest.Production,
      presortedAt: new Date(),
      notes: 'Quick-complete: dock-side pre-sorted at intake'
    });
    return qItem?.barcode ?? String(id);
  }

  splitContainer(form: PresortFormState): string[] {
    const sourceId = form.activeId!;
    const qItem = this.mockData.presortQueue.find(q => q.id === sourceId);
    const newBarcodes: string[] = [];

    this.mockData.updateContainer(sourceId, {
      status: ContainerStatus.Available,
      closedAt: new Date(),
      notes: `Split into ${form.items.length} containers`
    });

    for (const item of form.items) {
      const c = this.mockData.createContainer({
        containerType: form.containerType,
        presortMethod: form.presortMethod,
        presortWorkerName: this.mockData.session.staffName,
        contents: [
          {
            categoryKey: item.categoryKey,
            categoryName: item.categoryName,
            quantity: item.quantity,
            condition: item.condition,
            ecommerceQty: item.ecommerceQty > 0 ? item.ecommerceQty : undefined
          }
        ],
        destination: form.destination,
        status: ContainerStatus.Sorting,
        presortedAt: new Date(),
        totalItems: item.quantity,
        notes: `Split from ${qItem?.barcode ?? 'parent container'}`,
        parentContainerId: sourceId
      });
      newBarcodes.push(c.barcode);
    }

    return newBarcodes;
  }
}
