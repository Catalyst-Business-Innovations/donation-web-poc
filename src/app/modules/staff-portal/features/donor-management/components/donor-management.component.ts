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

  protected query = signal('');
  protected tierFilter = signal<DonorTier | ''>('');
  protected readonly DT = DonorTier;
  protected mode = signal<ModalMode>(null);
  protected active = signal<Donor | null>(null);
  protected form: DonorEditForm = DonorMgmtMapper.emptyForm();

  readonly donors = computed(() => {
    const q = this.query().toLowerCase();
    const tf = this.tierFilter();
    return this.svc.donors.filter(d => {
      const mQ = !q || `${d.firstName} ${d.lastName} ${d.phone} ${d.email}`.toLowerCase().includes(q);
      return mQ && (!tf || d.loyaltyTier === tf);
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

  get canSaveDonor(): boolean {
    return !!this.form.firstName.trim() && !!this.form.lastName.trim() && !!this.form.phone.trim();
  }

  confirm(): void {
    if (!this.canSaveDonor) {
      this.toast.warning('Incomplete', 'First name, last name and phone are required.');
      return;
    }
    const m = this.mode();
    if (m === 'edit' && this.active()) {
      this.svc.updateDonor(this.active()!.id, {
        firstName: this.form.firstName.trim(),
        lastName:  this.form.lastName.trim(),
        email:     this.form.email.trim(),
        phone:     this.form.phone.trim(),
        address:   this.form.address.trim(),
      });
      this.toast.success('Saved!', `${this.form.firstName} ${this.form.lastName}'s info updated.`);
    } else if (m === 'add') {
      this.svc.addDonor({
        firstName: this.form.firstName.trim(),
        lastName:  this.form.lastName.trim(),
        email:     this.form.email.trim(),
        phone:     this.form.phone.trim(),
        address:   this.form.address.trim(),
        preferredLocationId: this.svc.session.locationId,
      });
      this.toast.success('Enrolled!', `${this.form.firstName} ${this.form.lastName} registered.`);
    }
    this.close();
  }

  get modalTitle(): string {
    return { view: 'Donor Details', add: 'Add New Donor', edit: 'Edit Donor' }[this.mode()!] ?? '';
  }
  get confirmLabel(): string {
    return { view: 'Edit Donor', add: 'Create Donor', edit: 'Save Changes' }[this.mode()!] ?? 'Save';
  }
}
