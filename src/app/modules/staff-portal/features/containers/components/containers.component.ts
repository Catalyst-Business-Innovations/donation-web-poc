import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MockDataService } from '../../../../../core/services/mock-data.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { ContainersMapper } from '../models/containers.models';
import {
  Container, ContainerStatus, ContainerDest, ContainerType, ContainerTypeLabel, ItemConditionLabel
} from '../../../../../core/models/domain.models';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { IconComponent, IconName } from '../../../../../shared/components/icon/icon.component';

const CONTAINER_CAPACITY: Record<ContainerType, number> = {
  [ContainerType.Gaylord]:  400,
  [ContainerType.CartRack]: 80,
  [ContainerType.Pallet]:   200,
  [ContainerType.Tote]:     50,
  [ContainerType.Baler]:    0,
};

@Component({
  selector: 'app-containers',
  standalone: true,
  imports: [FormsModule, DatePipe, ModalComponent, IconComponent],
  templateUrl: './containers.component.html',
  styleUrl: './containers.component.scss'
})
export class ContainersComponent {
  protected mockData = inject(MockDataService);
  protected toast = inject(ToastService);
  protected mapper = ContainersMapper;
  readonly CAPACITY = CONTAINER_CAPACITY;

  // expose enums for template
  protected readonly CS = ContainerStatus;
  protected readonly CD = ContainerDest;
  protected readonly CT = ContainerType;
  protected readonly CTL = ContainerTypeLabel;
  protected readonly ICL = ItemConditionLabel;

  // ── List / filter state ────────────────────────────────────────────────────
  protected query = '';
  protected statusFilter = '' as ContainerStatus | '';
  protected destFilter = '' as ContainerDest | '';
  protected deptFilter = '';

  readonly pipeline = computed(() => {
    const cnts = this.mockData.containers;
    const n = (s: ContainerStatus) => cnts.filter(c => c.status === s).length;
    return [
      { status: ContainerStatus.Available,       icon: 'download'  as IconName, label: 'Available',        count: n(ContainerStatus.Available) },
      { status: ContainerStatus.ReadyForSorting, icon: 'clock'     as IconName, label: 'Ready for Sorting', count: n(ContainerStatus.ReadyForSorting) },
      { status: ContainerStatus.Sorting,         icon: 'list'      as IconName, label: 'Sorting',           count: n(ContainerStatus.Sorting) },
      { status: ContainerStatus.InUse,           icon: 'settings'  as IconName, label: 'In Use',            count: n(ContainerStatus.InUse) },
    ];
  });

  readonly filtered = computed(() => {
    const q = this.query.toLowerCase();
    return this.mockData.containers.filter(c => {

      const mQ = !q || c.barcode.toLowerCase().includes(q)
        || c.locationName.toLowerCase().includes(q)
        || (c.deptName ?? '').toLowerCase().includes(q)
        || (c.catName ?? '').toLowerCase().includes(q);
      const mS = !this.statusFilter || c.status === this.statusFilter;
      const mD = !this.destFilter || c.destination === this.destFilter;
      const mDept = !this.deptFilter || c.deptKey === this.deptFilter;
      return mQ && mS && mD && mDept;
    });
  });

  setStatusFilter(s: ContainerStatus | ''): void {
    this.statusFilter = this.statusFilter === s ? '' : s;
  }

  fillPct(c: Container): number {
    const cap = CONTAINER_CAPACITY[c.containerType];
    if (!cap) return 0;
    return Math.min(100, Math.round((c.totalItems / cap) * 100));
  }

  // ── Selection ──────────────────────────────────────────────────────────────
  protected selectedIds = signal<Set<string>>(new Set());

  isSelected(id: string): boolean { return this.selectedIds().has(id); }

  readonly allSelected = computed(() => {
    const f = this.filtered();
    return f.length > 0 && f.every(c => this.selectedIds().has(c.id));
  });

  readonly selectionCount = computed(() => this.selectedIds().size);

  readonly selectedContainers = computed(() =>
    this.mockData.containers.filter(c => this.selectedIds().has(c.id))
  );

  toggleSelect(id: string): void {
    this.selectedIds.update(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  toggleSelectAll(): void {
    if (this.allSelected()) {
      this.selectedIds.set(new Set());
    } else {
      this.selectedIds.set(new Set(this.filtered().map(c => c.id)));
    }
  }

  clearSelection(): void { this.selectedIds.set(new Set()); }

  // ── Status advance ─────────────────────────────────────────────────────────
  nextStatus(c: Container): ContainerStatus | null {
    const map: Partial<Record<ContainerStatus, ContainerStatus>> = {
      [ContainerStatus.Available]:       ContainerStatus.ReadyForSorting,
      [ContainerStatus.ReadyForSorting]: ContainerStatus.Sorting,
      [ContainerStatus.Sorting]:         ContainerStatus.InUse,
    };
    return map[c.status] ?? null;
  }

  nextStatusLabel(c: Container): string {
    const labels: Partial<Record<ContainerStatus, string>> = {
      [ContainerStatus.Available]:       'Queue for Sorting',
      [ContainerStatus.ReadyForSorting]: 'Start Sorting',
      [ContainerStatus.Sorting]:         'Mark In Use',
    };
    return labels[c.status] ?? '';
  }

  advanceStatus(c: Container): void {
    const ns = this.nextStatus(c);
    if (!ns) return;
    if (ns === ContainerStatus.ReadyForSorting && !c.destination) {
      this.toast.warning('Destination Required', 'Set a destination before queuing for sorting.');
      this.openEdit(c);
      return;
    }
    const updates: Partial<Container> = { status: ns };
    if (ns === ContainerStatus.Sorting) updates.presortedAt = new Date();
    this.mockData.updateContainer(c.id, updates);
    if (this.viewing()?.id === c.id) {
      this.viewing.set(this.mockData.containers.find(x => x.id === c.id) ?? null);
    }
    this.toast.success('Status Updated', `${c.barcode} → ${ContainersMapper.statusLabel(ns)}`);
  }

  disposeContainer(c: Container): void {
    this.mockData.updateContainer(c.id, { status: ContainerStatus.Available, closedAt: new Date() });
    this.toast.info('Reset', `Container ${c.barcode} reset to Available.`);
    this.viewing.set(null);
  }

  // ── Detail view ────────────────────────────────────────────────────────────
  protected viewing = signal<Container | null>(null);
  openDetail(c: Container): void { this.viewing.set(c); }

  detailTimeline(c: Container): { label: string; time: Date | undefined; done: boolean; icon: IconName }[] {
    return [
      { label: 'Available',        time: c.createdAt,   done: true,                                                                         icon: 'download' },
      { label: 'Ready for Sorting',time: undefined,     done: c.status !== ContainerStatus.Available,                                       icon: 'clock'    },
      { label: 'Sorting',          time: c.presortedAt, done: [ContainerStatus.Sorting, ContainerStatus.InUse].includes(c.status),          icon: 'list'     },
      { label: 'In Use',           time: undefined,     done: c.status === ContainerStatus.InUse,                                           icon: 'settings' },
    ];
  }

  // ── Create form ────────────────────────────────────────────────────────────
  protected creating = signal(false);
  protected cType: ContainerType = ContainerType.Gaylord;
  protected cDeptKey = '';
  protected cCatKey = '';
  protected cDest = null as ContainerDest | null;
  protected cTransferTo = '';
  protected cStatus: ContainerStatus = ContainerStatus.Available;
  protected cSalvageWeight = '';
  protected cNotes = '';

  readonly cDeptCats = computed(() => {
    if (!this.cDeptKey) return [];
    return this.mockData.departments.find(d => d.key === this.cDeptKey)?.categories ?? [];
  });

  openCreate(): void {
    this.cType = ContainerType.Gaylord;
    this.cDeptKey = ''; this.cCatKey = '';
    this.cDest = null; this.cTransferTo = ''; this.cStatus = ContainerStatus.Available;
    this.cSalvageWeight = ''; this.cNotes = '';
    this.creating.set(true);
  }

  saveCreate(): void {
    if (!this.cDeptKey) { this.toast.error('Validation', 'Select a department.'); return; }
    if (this.cDest === ContainerDest.Transfer && !this.cTransferTo) {
      this.toast.error('Validation', 'Select a transfer destination store.'); return;
    }
    const dept = this.mockData.departments.find(d => d.key === this.cDeptKey)!;
    const cat  = this.cCatKey ? dept.categories.find(c => c.key === this.cCatKey) : null;
    const xferLoc = this.cDest === ContainerDest.Transfer ? this.mockData.locations.find(l => l.id === this.cTransferTo) : null;
    const newC = this.mockData.createContainer({
      containerType: this.cType,
      deptKey: dept.key, deptName: dept.name,
      catKey: cat?.key, catName: cat?.name,
      destination: this.cDest ?? undefined,
      transferToLocationId: xferLoc?.id,
      transferToLocationName: xferLoc?.name,
      status: this.cStatus,
      salvageWeightLbs: this.cSalvageWeight ? parseFloat(this.cSalvageWeight) : undefined,
      notes: this.cNotes || undefined,
    });
    this.toast.success('Created', `Container ${newC.barcode} created.`);
    this.creating.set(false);
  }

  // ── Edit form ──────────────────────────────────────────────────────────────
  protected editing = signal<Container | null>(null);
  protected eStatus: ContainerStatus = ContainerStatus.Available;
  protected eDest = null as ContainerDest | null;
  protected eTransferTo = '';
  protected eNotes = '';

  openEdit(c: Container): void {
    this.eStatus = c.status;
    this.eDest = c.destination ?? null;
    this.eTransferTo = c.transferToLocationId ?? '';
    this.eNotes = c.notes ?? '';
    this.editing.set(c);
  }

  saveEdit(): void {
    const c = this.editing();
    if (!c) return;
    if (this.eDest === ContainerDest.Transfer && !this.eTransferTo) {
      this.toast.error('Validation', 'Select a transfer destination store.'); return;
    }
    const xferLoc = this.eDest === ContainerDest.Transfer ? this.mockData.locations.find(l => l.id === this.eTransferTo) : null;
    const updates: Partial<Container> = {
      status: this.eStatus,
      destination: this.eDest ?? undefined,
      transferToLocationId: xferLoc?.id ?? undefined,
      transferToLocationName: xferLoc?.name ?? undefined,
      notes: this.eNotes || undefined
    };
    if (this.eStatus === ContainerStatus.Sorting && !c.presortedAt) updates.presortedAt = new Date();
    this.mockData.updateContainer(c.id, updates);
    this.toast.success('Updated', `${c.barcode} saved.`);
    this.editing.set(null);
  }

  // ── Merge ──────────────────────────────────────────────────────────────────
  protected merging = signal(false);
  protected mType: ContainerType = ContainerType.Gaylord;
  protected mDeptKey = '';
  protected mCatKey = '';
  protected mDest = null as ContainerDest | null;
  protected mTransferTo = '';
  protected mNotes = '';

  readonly mDeptCats = computed(() => {
    if (!this.mDeptKey) return [];
    return this.mockData.departments.find(d => d.key === this.mDeptKey)?.categories ?? [];
  });

  readonly mergeTotal = computed(() =>
    this.selectedContainers().reduce((s, c) => s + c.totalItems, 0)
  );

  openMerge(): void {
    const sel = this.selectedContainers();
    if (sel.length < 2) { this.toast.warning('Select 2+', 'Select at least 2 containers to merge.'); return; }
    this.mType = sel[0].containerType;
    this.mDeptKey = sel[0].deptKey ?? '';
    this.mCatKey = sel[0].catKey ?? '';
    this.mDest = sel[0].destination ?? null;
    this.mTransferTo = '';
    this.mNotes = '';
    this.merging.set(true);
  }

  saveMerge(): void {
    if (!this.mDeptKey) { this.toast.error('Validation', 'Select a department.'); return; }
    if (this.mDest === ContainerDest.Transfer && !this.mTransferTo) {
      this.toast.error('Validation', 'Select a transfer destination store.'); return;
    }
    const ids = Array.from(this.selectedIds());
    const dept = this.mockData.departments.find(d => d.key === this.mDeptKey)!;
    const cat  = this.mCatKey ? dept.categories.find(c => c.key === this.mCatKey) : null;
    const xferLoc = this.mDest === ContainerDest.Transfer ? this.mockData.locations.find(l => l.id === this.mTransferTo) : null;
    const mergedContents = this.selectedContainers().flatMap(c => c.contents);
    const newC = this.mockData.createContainer({
      containerType: this.mType,
      deptKey: dept.key, deptName: dept.name,
      catKey: cat?.key, catName: cat?.name,
      destination: this.mDest ?? undefined,
      transferToLocationId: xferLoc?.id,
      transferToLocationName: xferLoc?.name,
      status: ContainerStatus.Sorting,
      presortedAt: new Date(),
      contents: mergedContents,
      totalItems: this.mergeTotal(),
      mergedContainerIds: ids,
      notes: this.mNotes || `Merged from ${ids.length} containers`
    });
    for (const id of ids) {
      this.mockData.updateContainer(id, {
        status: ContainerStatus.Available,
        notes: `Merged into ${newC.barcode}`
      });
    }
    this.toast.success('Merged', `${ids.length} containers merged → ${newC.barcode}`);
    this.clearSelection();
    this.merging.set(false);
  }

  // ── Bulk status ────────────────────────────────────────────────────────────
  protected bulkUpdating = signal(false);
  protected bulkStatus: ContainerStatus = ContainerStatus.ReadyForSorting;

  openBulkStatus(): void {
    if (this.selectedIds().size === 0) return;
    this.bulkStatus = ContainerStatus.ReadyForSorting;
    this.bulkUpdating.set(true);
  }

  saveBulkStatus(): void {
    const ids = Array.from(this.selectedIds());
    for (const id of ids) {
      const updates: Partial<Container> = { status: this.bulkStatus };

      this.mockData.updateContainer(id, updates);
    }
    this.toast.success('Bulk Updated', `${ids.length} containers → ${ContainersMapper.statusLabel(this.bulkStatus)}`);
    this.clearSelection();
    this.bulkUpdating.set(false);
  }

  // ── Print label ────────────────────────────────────────────────────────────
  printSelectedLabels(): void {
    const ids = Array.from(this.selectedIds());
    const containers = this.mockData.containers.filter(c => ids.includes(c.id));
    containers.forEach(c => this.printLabel(c));
    this.toast.success('Printing', `${containers.length} label(s) sent to print.`);
  }

  printLabel(c: Container): void {
    const contentsHtml = c.contents.length > 0
      ? c.contents.map(x =>
          `<tr><td>${x.categoryName}</td><td>${x.quantity}</td><td>${ContainersMapper.condLabel(x.condition)}</td></tr>`
        ).join('')
      : '<tr><td colspan="3" style="color:#999;text-align:center">No contents logged yet</td></tr>';
    const win = window.open('', '_blank', 'width=420,height=560');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Label – ${c.barcode}</title><style>
body{font-family:Arial,sans-serif;margin:0;padding:20px;font-size:12px;background:#fff}
h2{font-size:14px;font-weight:700;margin:0 0 2px;color:#666}
.barcode{font-size:20px;font-weight:900;font-family:monospace;letter-spacing:1px;margin:8px 0}
.chips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
.chip{padding:2px 9px;border-radius:999px;font-size:11px;font-weight:700;border:1px solid #ddd}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 12px;margin-bottom:12px}
.cell label{font-size:9px;text-transform:uppercase;color:#888;display:block;margin-bottom:1px}
table{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:8px}
th,td{border:1px solid #ddd;padding:4px 6px;text-align:left}
th{background:#f5f5f5;font-size:9px;text-transform:uppercase;font-weight:700}
.footer{margin-top:12px;font-size:9px;color:#aaa;text-align:right;border-top:1px solid #eee;padding-top:6px}
.notes{font-size:11px;color:#555;background:#fafafa;border:1px solid #eee;padding:6px;border-radius:4px;margin-bottom:8px}
@media print{.print-btn{display:none}}
</style></head><body>
<h2>${c.locationName}</h2>
<div class="barcode">${c.barcode}</div>
<div class="chips">
  <span class="chip" style="background:#dbeafe;color:#1e40af;border-color:#93c5fd">${ContainerTypeLabel[c.containerType]}</span>
  <span class="chip" style="background:#dcfce7;color:#166534;border-color:#86efac">${ContainersMapper.statusLabel(c.status)}</span>
  ${c.destination ? `<span class="chip" style="background:#fef3c7;color:#92400e;border-color:#fcd34d">${ContainersMapper.destLabel(c.destination)}</span>` : ''}
</div>
<div class="grid">
  <div class="cell"><label>Department</label>${c.deptName ?? '—'}</div>
  <div class="cell"><label>Category</label>${c.catName ?? 'Any'}</div>
  <div class="cell"><label>Total Items</label><strong>${c.totalItems || '—'}</strong></div>
  <div class="cell"><label>Created</label>${new Date(c.createdAt).toLocaleDateString()}</div>
  ${c.presortWorkerName ? `<div class="cell"><label>Presort Worker</label>${c.presortWorkerName}</div>` : ''}
  ${c.salvageWeightLbs ? `<div class="cell"><label>Salvage Weight</label>${c.salvageWeightLbs} lbs</div>` : ''}
  ${c.transferToLocationName ? `<div class="cell"><label>Transfer To</label>${c.transferToLocationName}</div>` : ''}
</div>
${c.notes ? `<div class="notes"><strong>Notes:</strong> ${c.notes}</div>` : ''}
<table>
  <thead><tr><th>Category</th><th>Qty</th><th>Condition</th></tr></thead>
  <tbody>${contentsHtml}</tbody>
</table>
<button class="print-btn" onclick="window.print()" style="padding:6px 16px;cursor:pointer;background:#1a56db;color:#fff;border:none;border-radius:4px;font-size:12px;margin-bottom:8px">🖨 Print Label</button>
<div class="footer">Brijjworks · ${new Date().toLocaleString()}</div>
</body></html>`);
    win.document.close();
  }
}

