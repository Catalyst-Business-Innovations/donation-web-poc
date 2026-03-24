import { Injectable, inject } from '@angular/core';
import { MockDataService } from '@core/services/mock-data.service';
import { Container, ContainerStatus, ContainerDest, ContainerTypeLabel } from '@core/models/domain.models';
import {
  ContainerRowState,
  ContainerDetailState,
  PipelineStageState,
  ContainerEditInfoState,
  DepartmentOption,
  CategoryOption,
  LocationOption
} from '../models/containers.state';
import { ContainerResponse } from '../models/containers.response';
import {
  mapContainerToRow,
  mapContainerToDetail,
  computePipeline,
  mapContainerToEditInfo,
  statusLabel,
  condLabel,
  destLabel
} from '../models/containers.mapper';
import {
  CreateContainerRequest,
  UpdateContainerRequest,
  MergeContainersRequest,
  BulkStatusRequest
} from '../models/containers.request';

@Injectable({ providedIn: 'root' })
export class ContainerService {
  private readonly mockData = inject(MockDataService);

  // ── Queries ──────────────────────────────────────────────────────────────────

  getContainerRows(
    query: string,
    statusFilter: ContainerStatus | '',
    destFilter: ContainerDest | '',
    deptFilter: string
  ): ContainerRowState[] {
    const q = query.toLowerCase();
    return (this.mockData.containers as ContainerResponse[])
      .filter(c => {
        const mQ =
          !q ||
          c.barcode.toLowerCase().includes(q) ||
          c.locationName.toLowerCase().includes(q) ||
          (c.deptName ?? '').toLowerCase().includes(q) ||
          (c.catName ?? '').toLowerCase().includes(q);
        const mS = !statusFilter || c.status === statusFilter;
        const mD = !destFilter || c.destination === destFilter;
        const mDept = !deptFilter || c.deptKey === deptFilter;
        return mQ && mS && mD && mDept;
      })
      .map(mapContainerToRow);
  }

  getPipeline(): PipelineStageState[] {
    return computePipeline(this.mockData.containers as ContainerResponse[]);
  }

  getDetail(id: number): ContainerDetailState | null {
    const c = this.mockData.containers.find(x => x.id === id) as ContainerResponse | undefined;
    return c ? mapContainerToDetail(c) : null;
  }

  getEditInfo(id: number): ContainerEditInfoState | null {
    const c = this.mockData.containers.find(x => x.id === id) as ContainerResponse | undefined;
    return c ? mapContainerToEditInfo(c) : null;
  }

  getRawContainer(id: number): Container | undefined {
    return this.mockData.containers.find(x => x.id === id);
  }

  getSelectedContainers(ids: Set<number>): Container[] {
    return this.mockData.containers.filter(c => ids.has(c.id));
  }

  getDepartments(): DepartmentOption[] {
    return this.mockData.departments.map(d => ({ key: d.key, name: d.name }));
  }

  getCategoriesForDept(deptKey: string): CategoryOption[] {
    if (!deptKey) return [];
    const dept = this.mockData.departments.find(d => d.key === deptKey);
    return dept?.categories.map(c => ({ key: c.key, name: c.name })) ?? [];
  }

  getLocations(): LocationOption[] {
    return this.mockData.locations.map(l => ({ id: l.id, name: l.name }));
  }

  // ── Commands ─────────────────────────────────────────────────────────────────

  createContainer(req: CreateContainerRequest): string {
    const newC = this.mockData.createContainer({
      containerType: req.containerType,
      deptKey: req.deptKey,
      deptName: req.deptName,
      catKey: req.catKey,
      catName: req.catName,
      destination: req.destination,
      transferToLocationId: req.transferToLocationId,
      transferToLocationName: req.transferToLocationName,
      status: req.status,
      salvageWeightLbs: req.salvageWeightLbs,
      notes: req.notes
    });
    return newC.barcode;
  }

  updateContainer(id: number, req: UpdateContainerRequest): void {
    this.mockData.updateContainer(id, {
      status: req.status,
      destination: req.destination,
      transferToLocationId: req.transferToLocationId,
      transferToLocationName: req.transferToLocationName,
      notes: req.notes,
      presortedAt: req.presortedAt,
      closedAt: req.closedAt
    });
  }

  advanceStatus(id: number, newStatus: ContainerStatus): void {
    const updates: Partial<Container> = { status: newStatus };
    if (newStatus === ContainerStatus.Sorting) updates.presortedAt = new Date();
    if (newStatus === ContainerStatus.Available) updates.closedAt = new Date();
    this.mockData.updateContainer(id, updates);
  }

  resetContainer(id: number): void {
    this.mockData.updateContainer(id, { status: ContainerStatus.Available, closedAt: new Date() });
  }

  mergeContainers(req: MergeContainersRequest): string {
    const newC = this.mockData.createContainer({
      containerType: req.containerType,
      deptKey: req.deptKey,
      deptName: req.deptName,
      catKey: req.catKey,
      catName: req.catName,
      destination: req.destination,
      transferToLocationId: req.transferToLocationId,
      transferToLocationName: req.transferToLocationName,
      status: ContainerStatus.Sorting,
      presortedAt: new Date(),
      contents: req.mergedContents,
      totalItems: req.totalItems,
      mergedContainerIds: req.sourceIds,
      notes: req.notes || `Merged from ${req.sourceIds.length} containers`
    });
    for (const id of req.sourceIds) {
      this.mockData.updateContainer(id, {
        status: ContainerStatus.Available,
        notes: `Merged into ${newC.barcode}`
      });
    }
    return newC.barcode;
  }

  bulkUpdateStatus(req: BulkStatusRequest): void {
    for (const id of req.containerIds) {
      this.mockData.updateContainer(id, { status: req.status });
    }
  }

  getStatusLabel(s: ContainerStatus): string {
    return statusLabel(s);
  }

  getCondLabel(c: number): string {
    return condLabel(c);
  }

  // ── Label printing ───────────────────────────────────────────────────────────

  printLabel(c: Container): void {
    const e = this.escapeHtml;

    const contentsHtml =
      c.contents.length > 0
        ? c.contents
            .map(
              x => `<tr><td>${e(x.categoryName)}</td><td>${x.quantity}</td><td>${e(this.getCondLabel(x.condition))}</td></tr>`
            )
            .join('')
        : '<tr><td colspan="3" style="color:#999;text-align:center">No contents logged yet</td></tr>';

    const win = window.open('', '_blank', 'width=420,height=560');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Label \u2013 ${e(c.barcode)}</title><style>
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
<h2>${e(c.locationName)}</h2>
<div class="barcode">${e(c.barcode)}</div>
<div class="chips">
  <span class="chip" style="background:#dbeafe;color:#1e40af;border-color:#93c5fd">${e(ContainerTypeLabel[c.containerType])}</span>
  <span class="chip" style="background:#dcfce7;color:#166534;border-color:#86efac">${e(statusLabel(c.status))}</span>
  ${c.destination ? `<span class="chip" style="background:#fef3c7;color:#92400e;border-color:#fcd34d">${e(destLabel(c.destination))}</span>` : ''}
</div>
<div class="grid">
  <div class="cell"><label>Department</label>${e(c.deptName ?? '\u2014')}</div>
  <div class="cell"><label>Category</label>${e(c.catName ?? 'Any')}</div>
  <div class="cell"><label>Total Items</label><strong>${c.totalItems || '\u2014'}</strong></div>
  <div class="cell"><label>Created</label>${e(new Date(c.createdAt).toLocaleDateString())}</div>
  ${c.presortWorkerName ? `<div class="cell"><label>Presort Worker</label>${e(c.presortWorkerName)}</div>` : ''}
  ${c.salvageWeightLbs ? `<div class="cell"><label>Salvage Weight</label>${c.salvageWeightLbs} lbs</div>` : ''}
  ${c.transferToLocationName ? `<div class="cell"><label>Transfer To</label>${e(c.transferToLocationName)}</div>` : ''}
</div>
${c.notes ? `<div class="notes"><strong>Notes:</strong> ${e(c.notes)}</div>` : ''}
<table>
  <thead><tr><th>Category</th><th>Qty</th><th>Condition</th></tr></thead>
  <tbody>${contentsHtml}</tbody>
</table>
<button class="print-btn" onclick="window.print()" style="padding:6px 16px;cursor:pointer;background:#1a56db;color:#fff;border:none;border-radius:4px;font-size:12px;margin-bottom:8px">Print Label</button>
<div class="footer">Brijjworks \u00b7 ${e(new Date().toLocaleString())}</div>
</body></html>`);
    win.document.close();
  }

  /** Escape HTML entities to prevent XSS in label printing */
  private escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}
