import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ToastService } from '@core/services/toast.service';
import { ContainerDest, ContainerType, ItemCondition, PresortMethod } from '@core/models/domain.models';
import { PresortService } from '../services/presort.service';
import { PresortFormState, PresortQueueItemState, PresortConfirmState } from '../models/presort.state';
import {
  emptyFormState,
  updateWorkItemCondition,
  createWorkItem,
  buildConfirmState,
  buildQueueSummary,
  destinationLabel,
  conditionBadgeClass,
  isSalvageOrDispose
} from '../models/presort.mapper';
import { PresortStatsBarComponent } from '../components/presort-stats-bar/presort-stats-bar.component';
import { PresortQueueListComponent } from '../components/presort-queue-list/presort-queue-list.component';
import { PresortWorkPanelComponent } from '../components/presort-work-panel/presort-work-panel.component';
import { PresortConfirmModalComponent } from '../components/presort-confirm-modal/presort-confirm-modal.component';
import { PresortSplitModalComponent } from '../components/presort-split-modal/presort-split-modal.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ModalComponent } from '@shared/components/modal/modal.component';

@Component({
  selector: 'app-presort-page',
  standalone: true,
  imports: [
    PresortStatsBarComponent,
    PresortQueueListComponent,
    PresortWorkPanelComponent,
    PresortConfirmModalComponent,
    PresortSplitModalComponent,
    IconComponent,
    ModalComponent
  ],
  templateUrl: './presort-page.component.html',
  styleUrl: './presort-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PresortPageComponent {
  private readonly presortService = inject(PresortService);
  private readonly toast = inject(ToastService);

  // ── Core state ─────────────────────────────────────────────────────────────
  protected readonly formState = signal<PresortFormState>(emptyFormState());
  protected readonly showConfirm = signal(false);
  protected readonly showSplitConfirm = signal(false);
  protected readonly quickCompleteId = signal<number | null>(null);

  // ── Computed ───────────────────────────────────────────────────────────────
  protected readonly queue = computed(() => this.presortService.getQueue());
  protected readonly stats = computed(() => this.presortService.getStats());
  protected readonly categories = computed(() => this.presortService.getCategories());
  protected readonly queueSummary = computed(() => this.presortService.getQueueSummary());

  protected readonly activeQueueItem = computed(() => this.queue().find(q => q.id === this.formState().activeId));

  protected readonly confirmState = computed<PresortConfirmState | null>(() => {
    if (!this.showConfirm()) return null;
    return buildConfirmState(this.formState(), this.activeQueueItem());
  });

  protected readonly splitDestLabel = computed(() => destinationLabel(this.formState().destination));

  protected readonly quickCompleteBarcode = computed(() => {
    const id = this.quickCompleteId();
    return this.queue().find(q => q.id === id)?.barcode ?? '';
  });

  // ── Queue actions ──────────────────────────────────────────────────────────
  onContainerSelected(item: PresortQueueItemState): void {
    this.formState.set(this.presortService.buildInitialFormState(item));
  }

  onQuickComplete(item: PresortQueueItemState): void {
    this.quickCompleteId.set(item.id);
  }

  onConfirmQuickComplete(): void {
    const id = this.quickCompleteId();
    if (!id) return;
    const barcode = this.presortService.quickComplete(id);
    this.toast.success('Quick Complete', `${barcode} marked sorted \u2192 Production.`);
    this.quickCompleteId.set(null);
  }

  // ── Form state setters ─────────────────────────────────────────────────────
  onDestChanged(v: ContainerDest): void {
    this.formState.update(s => ({ ...s, destination: v }));
  }

  onContainerTypeChanged(v: ContainerType): void {
    this.formState.update(s => ({ ...s, containerType: v }));
  }

  onPresortMethodChanged(v: PresortMethod): void {
    this.formState.update(s => ({ ...s, presortMethod: v }));
  }

  onSeasonalChanged(v: boolean): void {
    this.formState.update(s => ({ ...s, isSeasonal: v }));
  }

  onSeasonalTagChanged(v: string): void {
    this.formState.update(s => ({ ...s, seasonalTag: v }));
  }

  onEcommerceChanged(v: boolean): void {
    this.formState.update(s => ({ ...s, ecommerce: v }));
  }

  onNotesChanged(v: string): void {
    this.formState.update(s => ({ ...s, notes: v }));
  }

  onSalvageWeightChanged(v: string): void {
    this.formState.update(s => ({ ...s, salvageWeightLbs: v ? parseFloat(v) : null }));
  }

  // ── Item actions ───────────────────────────────────────────────────────────
  onItemAdjusted(event: { categoryKey: string; delta: number }): void {
    this.formState.update(s => ({
      ...s,
      items: s.items
        .map(i => (i.categoryKey === event.categoryKey ? { ...i, quantity: Math.max(0, i.quantity + event.delta) } : i))
        .filter(i => i.quantity > 0)
    }));
  }

  onItemConditionChanged(event: { categoryKey: string; condition: ItemCondition }): void {
    this.formState.update(s => ({
      ...s,
      items: s.items.map(i => (i.categoryKey === event.categoryKey ? updateWorkItemCondition(i, event.condition) : i))
    }));
  }

  onItemEcommerceQtyChanged(event: { categoryKey: string; qty: number }): void {
    this.formState.update(s => ({
      ...s,
      items: s.items.map(i =>
        i.categoryKey === event.categoryKey ? { ...i, ecommerceQty: Math.max(0, Math.min(event.qty, i.quantity)) } : i
      )
    }));
  }

  onItemRemoved(categoryKey: string): void {
    this.formState.update(s => ({
      ...s,
      items: s.items.filter(i => i.categoryKey !== categoryKey)
    }));
  }

  onCategoryAdded(key: string): void {
    const cat = this.presortService.findCategory(key);
    if (!cat) return;
    if (this.formState().items.some(i => i.categoryKey === cat.key)) {
      this.toast.warning('Already Added', `${cat.name} is already in this container.`);
      return;
    }
    this.formState.update(s => ({
      ...s,
      items: [...s.items, createWorkItem(cat)]
    }));
  }

  // ── Complete / Split ───────────────────────────────────────────────────────
  onComplete(): void {
    if (!this.formState().items.length) {
      this.toast.warning('No Categories', 'Add at least one category before completing.');
      return;
    }
    this.showConfirm.set(true);
  }

  onConfirmComplete(): void {
    const form = this.formState();
    const id = form.activeId!;
    const result = this.presortService.completeContainer(id, form);
    this.toast.success('Presort Complete!', `${result.barcode} labeled and routed to ${result.destLabel}.`);
    this.formState.set(emptyFormState());
    this.showConfirm.set(false);
  }

  onSplit(): void {
    if (this.formState().items.length < 2) {
      this.toast.warning('Need Multiple Categories', 'Add at least 2 categories to split.');
      return;
    }
    this.showSplitConfirm.set(true);
  }

  onConfirmSplit(): void {
    const form = this.formState();
    const newBarcodes = this.presortService.splitContainer(form);
    this.toast.success(`Split into ${newBarcodes.length} containers`, newBarcodes.join(' \u00B7 '));
    this.formState.set(emptyFormState());
    this.showSplitConfirm.set(false);
  }

  onCancel(): void {
    this.formState.set(emptyFormState());
  }
}
