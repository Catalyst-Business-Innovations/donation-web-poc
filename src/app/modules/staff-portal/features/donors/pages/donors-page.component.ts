import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ToastService } from '@core/services/toast.service';
import { DonorTier } from '@core/models/domain.models';
import { DonorManagementService } from '../services/donor-management.service';
import { DonorFormState } from '../models/donor-management.state';
import { ModalMode } from '../models/donor-management.enum';
import { emptyDonorForm } from '../models/donor-management.mapper';
import { DonorSearchBarComponent } from '../components/donor-search-bar/donor-search-bar.component';
import { DonorTableComponent } from '../components/donor-table/donor-table.component';
import { DonorDetailModalComponent } from '../components/donor-detail-modal/donor-detail-modal.component';
import { DonorFormModalComponent } from '../components/donor-form-modal/donor-form-modal.component';

@Component({
  selector: 'app-donors-page',
  standalone: true,
  imports: [
    DecimalPipe,
    DonorSearchBarComponent,
    DonorTableComponent,
    DonorDetailModalComponent,
    DonorFormModalComponent
  ],
  templateUrl: './donors-page.component.html',
  styleUrl: './donors-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DonorsPageComponent {
  private readonly donorService = inject(DonorManagementService);
  protected readonly toast = inject(ToastService);

  protected readonly query = signal('');
  protected readonly tierFilter = signal<DonorTier | ''>('');
  protected readonly mode = signal<ModalMode>(null);
  protected readonly selectedDonorId = signal<number | null>(null);

  protected readonly filteredDonors = computed(() => this.donorService.getDonors(this.query(), this.tierFilter()));

  protected readonly selectedDonorDetail = computed(() => {
    const id = this.selectedDonorId();
    return id !== null ? this.donorService.getDonorDetail(id) : null;
  });

  protected readonly selectedDonorForm = computed(() => {
    const id = this.selectedDonorId();
    return id !== null ? this.donorService.getDonorForm(id) : emptyDonorForm();
  });

  protected readonly totalDonorCount = computed(() => this.donorService.getTotalDonorCount());

  onViewRequested(id: number): void {
    this.selectedDonorId.set(id);
    this.mode.set('view');
  }

  onEditRequested(id: number): void {
    this.selectedDonorId.set(id);
    this.mode.set('edit');
  }

  onEditFromDetail(): void {
    this.mode.set('edit');
  }

  onAddRequested(): void {
    this.selectedDonorId.set(null);
    this.mode.set('add');
  }

  onExportRequested(): void {
    this.toast.success('Export', 'CSV exported.');
  }

  onModalClosed(): void {
    this.mode.set(null);
  }

  onFormConfirmed(form: DonorFormState): void {
    const m = this.mode();
    if (m === 'edit' && this.selectedDonorId() !== null) {
      this.donorService.updateDonor(this.selectedDonorId()!, form);
      this.toast.success('Saved!', `${form.firstName} ${form.lastName}'s info updated.`);
    } else if (m === 'add') {
      this.donorService.createDonor(form);
      this.toast.success('Enrolled!', `${form.firstName} ${form.lastName} registered.`);
    }
    this.mode.set(null);
  }
}
