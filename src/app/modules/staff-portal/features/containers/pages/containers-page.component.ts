import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { ToastService } from '@core/services/toast.service';
import { ContainerStatus, ContainerDest, ContainerType } from '@core/models/domain.models';
import { nextStatus as getNextStatus } from '../models/containers.mapper';
import { ContainerService } from '../services/container.service';
import {
  ContainerFormState,
  ContainerEditState,
  ContainerEditInfoState,
  ContainerDetailState,
  MergeFormState
} from '../models/containers.state';
import { ContainerPipelineBarComponent } from '../components/container-pipeline-bar/container-pipeline-bar.component';
import { ContainerFiltersComponent } from '../components/container-filters/container-filters.component';
import { ContainerTableComponent } from '../components/container-table/container-table.component';
import { ContainerDetailPanelComponent } from '../components/container-detail-panel/container-detail-panel.component';
import { ContainerFormModalComponent } from '../components/container-form-modal/container-form-modal.component';
import { ContainerMergeModalComponent } from '../components/container-merge-modal/container-merge-modal.component';
import { ContainerBulkStatusModalComponent } from '../components/container-bulk-status-modal/container-bulk-status-modal.component';

@Component({
  selector: 'app-containers-page',
  standalone: true,
  imports: [
    ContainerPipelineBarComponent,
    ContainerFiltersComponent,
    ContainerTableComponent,
    ContainerDetailPanelComponent,
    ContainerFormModalComponent,
    ContainerMergeModalComponent,
    ContainerBulkStatusModalComponent
  ],
  templateUrl: './containers-page.component.html',
  styleUrl: './containers-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainersPageComponent {
  private readonly containerService = inject(ContainerService);
  private readonly toast = inject(ToastService);

  // ── Filter state ─────────────────────────────────────────────────────────────
  protected readonly query = signal('');
  protected readonly statusFilter = signal<ContainerStatus | ''>('');
  protected readonly destFilter = signal<ContainerDest | ''>('');
  protected readonly deptFilter = signal('');

  // ── Computed data ────────────────────────────────────────────────────────────
  readonly pipeline = computed(() => this.containerService.getPipeline());

  readonly filteredRows = computed(() =>
    this.containerService.getContainerRows(this.query(), this.statusFilter(), this.destFilter(), this.deptFilter())
  );

  readonly departments = computed(() => this.containerService.getDepartments());
  readonly locations = computed(() => this.containerService.getLocations());

  // ── Selection ────────────────────────────────────────────────────────────────
  protected readonly selectedIds = signal<Set<number>>(new Set());
  readonly selectionCount = computed(() => this.selectedIds().size);
  readonly allSelected = computed(() => {
    const rows = this.filteredRows();
    return rows.length > 0 && rows.every(r => this.selectedIds().has(r.id));
  });

  onToggleSelect(id: number): void {
    this.selectedIds.update(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  onToggleSelectAll(): void {
    if (this.allSelected()) {
      this.selectedIds.set(new Set());
    } else {
      this.selectedIds.set(new Set(this.filteredRows().map(r => r.id)));
    }
  }

  onClearSelection(): void {
    this.selectedIds.set(new Set());
  }

  // ── Detail panel ─────────────────────────────────────────────────────────────
  protected readonly viewingDetail = signal<ContainerDetailState | null>(null);

  onOpenDetail(id: number): void {
    const detail = this.containerService.getDetail(id);
    this.viewingDetail.set(detail);
  }

  onCloseDetail(): void {
    this.viewingDetail.set(null);
  }

  onAdvanceStatus(id: number): void {
    const raw = this.containerService.getRawContainer(id);
    if (!raw) return;

    const ns = getNextStatus(raw.status);
    if (!ns) return;

    if (ns === ContainerStatus.ReadyForSorting && !raw.destination) {
      this.toast.warning('Destination Required', 'Set a destination before queuing for sorting.');
      this.onOpenEdit(id);
      return;
    }

    this.containerService.advanceStatus(id, ns);

    // Refresh detail if viewing
    if (this.viewingDetail()?.id === id) {
      this.viewingDetail.set(this.containerService.getDetail(id));
    }

    this.toast.success('Status Updated', `${raw.barcode} \u2192 ${this.containerService.getStatusLabel(ns)}`);
  }

  onResetContainer(id: number): void {
    const raw = this.containerService.getRawContainer(id);
    if (!raw) return;
    this.containerService.resetContainer(id);
    this.toast.info('Reset', `Container ${raw.barcode} reset to Available.`);
    this.viewingDetail.set(null);
  }

  // ── Create form ──────────────────────────────────────────────────────────────
  protected readonly creating = signal(false);
  protected readonly createForm = signal<ContainerFormState | null>(null);

  readonly createDeptCats = computed(() => {
    const f = this.createForm();
    return f ? this.containerService.getCategoriesForDept(f.deptKey) : [];
  });

  onOpenCreate(): void {
    this.createForm.set({
      containerType: ContainerType.Gaylord,
      status: ContainerStatus.Available,
      deptKey: '',
      catKey: '',
      destination: null,
      transferToLocationId: null,
      salvageWeight: '',
      notes: ''
    });
    this.creating.set(true);
  }

  onCreateFormChanged(patch: Partial<ContainerFormState>): void {
    this.createForm.update(f => (f ? { ...f, ...patch } : f));
  }

  onCreateConfirmed(form: ContainerFormState): void {
    if (!form.deptKey) {
      this.toast.error('Validation', 'Select a department.');
      return;
    }
    if (form.destination === ContainerDest.Transfer && !form.transferToLocationId) {
      this.toast.error('Validation', 'Select a transfer destination store.');
      return;
    }
    const dept = this.containerService.getDepartments().find(d => d.key === form.deptKey);
    const cat = form.catKey
      ? this.containerService.getCategoriesForDept(form.deptKey).find(c => c.key === form.catKey)
      : null;
    const xferLoc =
      form.destination === ContainerDest.Transfer && form.transferToLocationId
        ? this.containerService.getLocations().find(l => l.id === form.transferToLocationId)
        : null;

    const barcode = this.containerService.createContainer({
      containerType: form.containerType,
      status: form.status,
      deptKey: dept!.key,
      deptName: dept!.name,
      catKey: cat?.key,
      catName: cat?.name,
      destination: form.destination ?? undefined,
      transferToLocationId: xferLoc?.id,
      transferToLocationName: xferLoc?.name,
      salvageWeightLbs: form.salvageWeight ? parseFloat(form.salvageWeight) : undefined,
      notes: form.notes || undefined
    });
    this.toast.success('Created', `Container ${barcode} created.`);
    this.creating.set(false);
  }

  onCreateClosed(): void {
    this.creating.set(false);
  }

  // ── Edit form ────────────────────────────────────────────────────────────────
  protected readonly editing = signal(false);
  protected readonly editForm = signal<ContainerEditState | null>(null);
  protected readonly editInfo = signal<ContainerEditInfoState | null>(null);
  private editingId: number | null = null;

  onOpenEdit(id: number): void {
    const raw = this.containerService.getRawContainer(id);
    if (!raw) return;
    this.editingId = id;
    this.editForm.set({
      status: raw.status,
      destination: raw.destination ?? null,
      transferToLocationId: raw.transferToLocationId ?? null,
      notes: raw.notes ?? ''
    });
    this.editInfo.set(this.containerService.getEditInfo(id));
    this.editing.set(true);
    // Close detail if open
    this.viewingDetail.set(null);
  }

  onEditFormChanged(patch: Partial<ContainerEditState>): void {
    this.editForm.update(f => (f ? { ...f, ...patch } : f));
  }

  onEditConfirmed(form: ContainerEditState): void {
    if (!this.editingId) return;
    if (form.destination === ContainerDest.Transfer && !form.transferToLocationId) {
      this.toast.error('Validation', 'Select a transfer destination store.');
      return;
    }
    const raw = this.containerService.getRawContainer(this.editingId);
    if (!raw) return;

    const xferLoc =
      form.destination === ContainerDest.Transfer && form.transferToLocationId
        ? this.containerService.getLocations().find(l => l.id === form.transferToLocationId)
        : null;

    this.containerService.updateContainer(this.editingId, {
      status: form.status,
      destination: form.destination ?? undefined,
      transferToLocationId: xferLoc?.id ?? undefined,
      transferToLocationName: xferLoc?.name ?? undefined,
      notes: form.notes || undefined,
      presortedAt: form.status === ContainerStatus.Sorting && !raw.presortedAt ? new Date() : undefined
    });
    this.toast.success('Updated', `${raw.barcode} saved.`);
    this.editing.set(false);
  }

  onEditClosed(): void {
    this.editing.set(false);
  }

  // ── Detail edit bridge ───────────────────────────────────────────────────────
  onDetailEditRequested(id: number): void {
    this.onOpenEdit(id);
  }

  // ── Merge ────────────────────────────────────────────────────────────────────
  protected readonly merging = signal(false);
  protected readonly mergeForm = signal<MergeFormState | null>(null);

  readonly mergeDeptCats = computed(() => {
    const f = this.mergeForm();
    return f ? this.containerService.getCategoriesForDept(f.deptKey) : [];
  });

  readonly mergeTotal = computed(() => {
    const selected = this.containerService.getSelectedContainers(this.selectedIds());
    return selected.reduce((s, c) => s + c.totalItems, 0);
  });

  onOpenMerge(): void {
    const selected = this.containerService.getSelectedContainers(this.selectedIds());
    if (selected.length < 2) {
      this.toast.warning('Select 2+', 'Select at least 2 containers to merge.');
      return;
    }
    this.mergeForm.set({
      containerType: selected[0].containerType,
      deptKey: selected[0].deptKey ?? '',
      catKey: selected[0].catKey ?? '',
      destination: selected[0].destination ?? null,
      transferToLocationId: null,
      notes: ''
    });
    this.merging.set(true);
  }

  onMergeFormChanged(patch: Partial<MergeFormState>): void {
    this.mergeForm.update(f => (f ? { ...f, ...patch } : f));
  }

  onMergeConfirmed(form: MergeFormState): void {
    if (!form.deptKey) {
      this.toast.error('Validation', 'Select a department.');
      return;
    }
    if (form.destination === ContainerDest.Transfer && !form.transferToLocationId) {
      this.toast.error('Validation', 'Select a transfer destination store.');
      return;
    }
    const ids = Array.from(this.selectedIds());
    const selected = this.containerService.getSelectedContainers(this.selectedIds());
    const dept = this.containerService.getDepartments().find(d => d.key === form.deptKey);
    const cat = form.catKey
      ? this.containerService.getCategoriesForDept(form.deptKey).find(c => c.key === form.catKey)
      : null;
    const xferLoc =
      form.destination === ContainerDest.Transfer && form.transferToLocationId
        ? this.containerService.getLocations().find(l => l.id === form.transferToLocationId)
        : null;

    const barcode = this.containerService.mergeContainers({
      sourceIds: ids,
      containerType: form.containerType,
      deptKey: dept!.key,
      deptName: dept!.name,
      catKey: cat?.key,
      catName: cat?.name,
      destination: form.destination ?? undefined,
      transferToLocationId: xferLoc?.id,
      transferToLocationName: xferLoc?.name,
      notes: form.notes,
      mergedContents: selected.flatMap(c => c.contents),
      totalItems: this.mergeTotal()
    });
    this.toast.success('Merged', `${ids.length} containers merged \u2192 ${barcode}`);
    this.onClearSelection();
    this.merging.set(false);
  }

  onMergeClosed(): void {
    this.merging.set(false);
  }

  // ── Bulk status ──────────────────────────────────────────────────────────────
  protected readonly bulkUpdating = signal(false);
  protected readonly bulkStatus = signal<ContainerStatus>(ContainerStatus.InUse);

  onOpenBulkStatus(): void {
    if (this.selectedIds().size === 0) return;
    this.bulkStatus.set(ContainerStatus.InUse);
    this.bulkUpdating.set(true);
  }

  onBulkStatusChanged(status: ContainerStatus): void {
    this.bulkStatus.set(status);
  }

  onBulkStatusConfirmed(status: ContainerStatus): void {
    const ids = Array.from(this.selectedIds());
    this.containerService.bulkUpdateStatus({ containerIds: ids, status });
    this.toast.success(
      'Bulk Updated',
      `${ids.length} containers \u2192 ${this.containerService.getStatusLabel(status)}`
    );
    this.onClearSelection();
    this.bulkUpdating.set(false);
  }

  onBulkStatusClosed(): void {
    this.bulkUpdating.set(false);
  }

  // ── Print labels ─────────────────────────────────────────────────────────────
  onPrintLabels(): void {
    const ids = Array.from(this.selectedIds());
    const containers = this.containerService.getSelectedContainers(new Set(ids));
    containers.forEach(c => this.containerService.printLabel(c));
    this.toast.success('Printing', `${containers.length} label(s) sent to print.`);
  }

  onPrintSingleLabel(id: number): void {
    const raw = this.containerService.getRawContainer(id);
    if (raw) {
      this.containerService.printLabel(raw);
      this.toast.success('Printing', '1 label sent to print.');
    }
  }

  // ── Pipeline click ───────────────────────────────────────────────────────────
  onPipelineStageClicked(status: ContainerStatus | ''): void {
    this.statusFilter.set(status);
  }
}
