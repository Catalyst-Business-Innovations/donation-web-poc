import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MockDataService } from '../../../../../core/services/mock-data.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { DonorMgmtMapper, DonorEditForm } from '../models/donor-management.models';
import { Donor, DonorTier } from '../../../../../core/models/domain.models';

type ModalMode = 'view' | 'add' | 'edit' | null;

@Component({
  selector: 'app-donor-management',
  standalone: true,
  imports: [FormsModule, DatePipe, DecimalPipe, ModalComponent, IconComponent],
  templateUrl: './donor-management.component.html',
  styleUrl: './donor-management.component.scss'
})
export class DonorManagementComponent {
  protected svc = inject(MockDataService);
  protected toast = inject(ToastService);
  protected mapper = DonorMgmtMapper;

  protected query = '';
  protected tierFilter: DonorTier | '' = '';
  protected readonly DT = DonorTier;
  protected mode = signal<ModalMode>(null);
  protected active = signal<Donor | null>(null);
  protected form: DonorEditForm = DonorMgmtMapper.emptyForm();

  readonly donors = computed(() => {
    const q = this.query.toLowerCase();
    return this.svc.donors.filter(d => {
      const mQ = !q || `${d.firstName} ${d.lastName} ${d.phone} ${d.email}`.toLowerCase().includes(q);
      return mQ && (!this.tierFilter || d.loyaltyTier === this.tierFilter);
    });
  });

  tierCfg(t: DonorTier) {
    return this.svc.getTier(t);
  }
  tierVariant(t: DonorTier) {
    return DonorMgmtMapper.tierVariant(t);
  }
  openView(d: Donor): void {
    this.active.set(d);
    this.mode.set('view');
  }
  openEdit(d: Donor): void {
    this.active.set(d);
    this.form = DonorMgmtMapper.toForm(d);
    this.mode.set('edit');
  }
  openAdd(): void {
    this.form = DonorMgmtMapper.emptyForm();
    this.mode.set('add');
  }
  close(): void {
    this.mode.set(null);
  }

  confirm(): void {
    this.toast.success('Saved!', this.mode() === 'add' ? 'New donor registered.' : 'Donor info saved.');
    this.close();
  }

  get modalTitle(): string {
    return { view: '👤 Donor Details', add: '+ Add New Donor', edit: '✏️ Edit Donor' }[this.mode()!] ?? '';
  }
  get confirmLabel(): string {
    return { view: 'Edit Donor', add: 'Create Donor', edit: 'Save Changes' }[this.mode()!] ?? 'Save';
  }
}
