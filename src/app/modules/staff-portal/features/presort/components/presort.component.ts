import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../../../../core/services/mock-data.service';
import { ToastService } from '../../../../../core/services/toast.service';
import {
  PresortMapper,
  PresortQueueItem,
  PresortState,
  PresortWorkItem,
  ageClass,
  ageLabel
} from '../models/presort.models';
import { ContainerDest, ContainerDestLabel, ContainerStatus, ContainerType, ItemCondition, ItemConditionLabel, PresortMethod, PresortMethodLabel } from '../../../../../core/models/domain.models';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { IconComponent, IconName } from '../../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-presort',
  standalone: true,
  imports: [FormsModule, ModalComponent, IconComponent],
  templateUrl: './presort.component.html',
  styleUrl: './presort.component.scss'
})
export class PresortComponent {
  protected mockData = inject(MockDataService);
  protected toast = inject(ToastService);

  // expose helpers to template
  protected readonly ageLabel = ageLabel;
  protected readonly ageClass = ageClass;
  protected readonly PM = PresortMethod;
  protected readonly IC = ItemCondition;
  protected readonly CD = ContainerDest;
  protected readonly CT = ContainerType;
  protected readonly CS = ContainerStatus;

  protected ps = signal<PresortState>(PresortMapper.empty());
  protected addCatKey = '';
  protected showConfirm = signal(false);
  protected showSplitConfirm = signal(false);
  protected splitBarcodes = signal<string[]>([]);
  protected quickCompleteId = signal<number | null>(null);

  // Live queue from mock data
  protected get queue(): PresortQueueItem[] {
    return this.mockData.presortQueue;
  }

  protected stats = computed(() => this.mockData.getPresortStats());

  readonly containerTypeOptions: { value: ContainerType; icon: IconName; label: string }[] = [
    { value: ContainerType.Gaylord,  icon: 'box',     label: 'Gaylord' },
    { value: ContainerType.CartRack, icon: 'layers',  label: 'Cart / Rack' },
    { value: ContainerType.Pallet,   icon: 'package', label: 'Pallet' },
    { value: ContainerType.Tote,     icon: 'package', label: 'Tote / Bin' },
    { value: ContainerType.Baler,    icon: 'refresh', label: 'Baler Bin' }
  ];

  readonly routeOptions: { value: ContainerDest; icon: IconName; label: string }[] = [
    { value: ContainerDest.Production, icon: 'settings', label: 'Production' },
    { value: ContainerDest.Reserve,    icon: 'package',  label: 'Reserve' },
    { value: ContainerDest.Warehouse,  icon: 'building', label: 'Warehouse' },
    { value: ContainerDest.Ecommerce,  icon: 'grid',     label: 'E-Commerce' },
    { value: ContainerDest.Salvage,    icon: 'refresh',  label: 'Salvage' }
  ];

  readonly conditions: { value: ItemCondition; label: string }[] = [
    { value: ItemCondition.Sellable,           label: 'Sellable' },
    { value: ItemCondition.NeedsRefurbishment, label: 'Needs Refurb' },
    { value: ItemCondition.Salvage,            label: 'Salvage' },
    { value: ItemCondition.Dispose,            label: 'Dispose' }
  ];

  readonly seasonalTags = [
    'Hold for Christmas',
    'Hold for Halloween',
    'Hold for Easter',
    'Hold for Summer',
    'Hold for Back-to-School'
  ];

  // ── Computed helpers ──────────────────────────────────────────

  protected activeQueueItem(): PresortQueueItem | undefined {
    return this.queue.find(q => q.id === this.ps().activeId);
  }

  protected activeBarcode(): string {
    return this.activeQueueItem()?.barcode ?? '';
  }

  protected hasSalvageItems(): boolean {
    return this.ps().items.some(i => i.condition === ItemCondition.Salvage || i.condition === ItemCondition.Dispose);
  }

  protected totalItemCount(): number {
    return this.ps().items.reduce((s, i) => s + i.quantity, 0);
  }

  protected salvageItemCount(): number {
    return this.ps().items.filter(i => i.condition === ItemCondition.Salvage || i.condition === ItemCondition.Dispose)
      .reduce((s, i) => s + i.quantity, 0);
  }

  protected backlogClass(): 'ok' | 'warn' | 'danger' {
    const n = this.queue.length;
    if (n <= 3) return 'ok';
    if (n <= 6) return 'warn';
    return 'danger';
  }

  protected containerTypeLabel(type: ContainerType): string {
    return this.containerTypeOptions.find(o => o.value === type)?.label ?? String(type);
  }

  protected containerTypeIcon(type: ContainerType): IconName {
    return this.containerTypeOptions.find(o => o.value === type)?.icon ?? 'box';
  }

  protected destLabel(d: ContainerDest | null): string {
    return d != null ? (ContainerDestLabel[d] ?? String(d)) : 'TBD';
  }

  protected condLabel(c: ItemCondition): string {
    return ItemConditionLabel[c] ?? String(c);
  }

  protected presortMethodLabel(m: PresortMethod): string {
    return PresortMethodLabel[m];
  }

  protected oldestQueueLabel(): string {
    if (!this.queue.length) return '—';
    const mins = Math.max(...this.queue.map(q => Math.floor((Date.now() - q.receivedAt.getTime()) / 60000)));
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    if (hrs === 0) return `${mins}m`;
    return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
  }

  protected oldestQueueClass(): 'ok' | 'warn' | 'danger' {
    if (!this.queue.length) return 'ok';
    const mins = Math.max(...this.queue.map(q => Math.floor((Date.now() - q.receivedAt.getTime()) / 60000)));
    if (mins < 60) return 'ok';
    if (mins < 180) return 'warn';
    return 'danger';
  }

  protected quickCompleteBarcode(): string {
    const id = this.quickCompleteId();
    return this.queue.find(q => q.id === id)?.barcode ?? '';
  }

  // ── Queue Actions ─────────────────────────────────────────────

  selectContainer(item: PresortQueueItem): void {
    this.ps.set({
      ...PresortMapper.empty(),
      activeId: item.id,
      containerType: item.containerType,
      presortMethod: item.presortMethod,
      items: [
        { categoryKey: 'clothing', categoryName: 'Clothing', icon: '👔', quantity: 12, condition: ItemCondition.Sellable, ecommerceQty: 0 },
        { categoryKey: 'shoes', categoryName: 'Shoes', icon: '👟', quantity: 6, condition: ItemCondition.Sellable, ecommerceQty: 0 },
        { categoryKey: 'books', categoryName: 'Books & Media', icon: '📚', quantity: 8, condition: ItemCondition.Sellable, ecommerceQty: 0 }
      ]
    });
  }

  /** Quick-complete: dock-side already-presorted container without detail entry */
  quickComplete(item: PresortQueueItem, event: Event): void {
    event.stopPropagation();
    this.quickCompleteId.set(item.id);
  }

  confirmQuickComplete(): void {
    const id = this.quickCompleteId();
    if (!id) return;
    const qItem = this.queue.find(q => q.id === id);
    this.mockData.updateContainer(id, {
      status: ContainerStatus.Sorting,
      destination: ContainerDest.Production,
      presortedAt: new Date(),
      notes: 'Quick-complete: dock-side pre-sorted at intake'
    });;
    this.toast.success('Quick Complete', `${qItem?.barcode ?? id} marked sorted → Production.`);
    this.quickCompleteId.set(null);
  }

  // ── Item Row Actions ──────────────────────────────────────────

  adjust(item: PresortWorkItem, d: number): void {
    this.ps.update(s => ({
      ...s,
      items: s.items
        .map(i => (i.categoryKey === item.categoryKey ? { ...i, quantity: Math.max(0, i.quantity + d) } : i))
        .filter(i => i.quantity > 0)
    }));
  }

  setCondition(item: PresortWorkItem, cond: ItemCondition): void {
    this.ps.update(s => ({
      ...s,
      items: s.items.map(i =>
        i.categoryKey === item.categoryKey
          ? { ...i, condition: cond, ecommerceQty: cond === ItemCondition.Salvage || cond === ItemCondition.Dispose ? 0 : i.ecommerceQty }
          : i
      )
    }));
  }

  setEcommerceQty(item: PresortWorkItem, qty: number): void {
    this.ps.update(s => ({
      ...s,
      items: s.items.map(i =>
        i.categoryKey === item.categoryKey ? { ...i, ecommerceQty: Math.max(0, Math.min(qty, i.quantity)) } : i
      )
    }));
  }

  removeItem(item: PresortWorkItem): void {
    this.ps.update(s => ({ ...s, items: s.items.filter(i => i.categoryKey !== item.categoryKey) }));
  }

  addCategory(): void {
    const cat = this.mockData.categories.find(c => c.key === this.addCatKey);
    if (!cat) return;
    if (this.ps().items.some(i => i.categoryKey === cat.key)) {
      this.toast.warning('Already Added', `${cat.name} is already in this container.`);
      return;
    }
    this.ps.update(s => ({
      ...s,
      items: [...s.items, { categoryKey: cat.key, categoryName: cat.name, icon: cat.icon, quantity: 1, condition: ItemCondition.Sellable, ecommerceQty: 0 }]
    }));
    this.addCatKey = '';
  }

  // ── State Setters ─────────────────────────────────────────────

  setDest(v: ContainerDest): void { this.ps.update(s => ({ ...s, destination: v })); }
  setNote(v: string): void { this.ps.update(s => ({ ...s, notes: v })); }
  setIsSeasonal(v: boolean): void { this.ps.update(s => ({ ...s, isSeasonal: v })); }
  setSeasonalTag(v: string): void { this.ps.update(s => ({ ...s, seasonalTag: v })); }
  setEcommerce(v: boolean): void { this.ps.update(s => ({ ...s, ecommerce: v })); }
  setSalvageWeight(v: string): void { this.ps.update(s => ({ ...s, salvageWeightLbs: v ? parseFloat(v) : null })); }
  setContainerType(v: ContainerType): void { this.ps.update(s => ({ ...s, containerType: v })); }
  setPresortMethod(v: PresortMethod): void { this.ps.update(s => ({ ...s, presortMethod: v })); }

  // ── Complete / Split ──────────────────────────────────────────

  complete(): void {
    if (!this.ps().items.length) {
      this.toast.warning('No Categories', 'Add at least one category before completing.');
      return;
    }
    this.showConfirm.set(true);
  }

  confirmComplete(): void {
    const state = this.ps();
    const qItem = this.activeQueueItem();
    const id = state.activeId!;
    this.mockData.updateContainer(id, {
      presortMethod: state.presortMethod,
      presortWorkerName: this.mockData.session.staffName,
      contents: state.items.map(i => ({
        categoryKey: i.categoryKey,
        categoryName: i.categoryName,
        quantity: i.quantity,
        condition: i.condition,
        ecommerceQty: i.ecommerceQty > 0 ? i.ecommerceQty : undefined
      })),
      destination: state.destination,
      status: ContainerStatus.Sorting,
      totalItems: this.totalItemCount(),
      salvageWeightLbs: state.salvageWeightLbs ?? undefined,
      isSeasonal: state.isSeasonal,
      seasonalTag: state.isSeasonal ? state.seasonalTag : undefined,
      notes: state.notes || undefined,
      presortedAt: new Date()
    });
    const bc = qItem?.barcode ?? '';
    const destLabel = this.routeOptions.find(o => o.value === state.destination)?.label ?? String(state.destination);
    this.toast.success('Presort Complete!', `${bc} labeled and routed to ${destLabel}.`);
    this.ps.set(PresortMapper.empty());
    this.showConfirm.set(false);
  }

  /** Split container: one new container per category */
  splitContainer(): void {
    if (this.ps().items.length < 2) {
      this.toast.warning('Need Multiple Categories', 'Add at least 2 categories to split.');
      return;
    }
    this.showSplitConfirm.set(true);
  }

  confirmSplit(): void {
    const state = this.ps();
    const qItem = this.activeQueueItem();
    const sourceId = state.activeId!;
    const newBarcodes: string[] = [];

    // Mark original container as disposed
    this.mockData.updateContainer(sourceId, {
      status: ContainerStatus.Available,
      closedAt: new Date(),
      notes: `Split into ${state.items.length} containers`
    });

    for (const item of state.items) {
      const c = this.mockData.createContainer({
        containerType: state.containerType,
        presortMethod: state.presortMethod,
        presortWorkerName: this.mockData.session.staffName,
        contents: [{ categoryKey: item.categoryKey, categoryName: item.categoryName, quantity: item.quantity, condition: item.condition, ecommerceQty: item.ecommerceQty > 0 ? item.ecommerceQty : undefined }],
        destination: state.destination,
        status: ContainerStatus.Sorting,
        presortedAt: new Date(),
        totalItems: item.quantity,
        notes: `Split from ${qItem?.barcode ?? 'parent container'}`,
        parentContainerId: sourceId
      });
      newBarcodes.push(c.barcode);
    }

    this.splitBarcodes.set(newBarcodes);
    this.toast.success(
      `Split into ${newBarcodes.length} containers`,
      newBarcodes.join(' · ')
    );
    this.ps.set(PresortMapper.empty());
    this.showSplitConfirm.set(false);
  }

  cancelForm(): void {
    this.ps.set(PresortMapper.empty());
  }
}
