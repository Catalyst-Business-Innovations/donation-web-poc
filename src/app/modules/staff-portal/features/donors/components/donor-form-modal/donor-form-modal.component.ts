import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { DonorFormState } from '../../models/donor-management.state';

@Component({
  selector: 'app-donor-form-modal',
  standalone: true,
  imports: [FormsModule, ModalComponent],
  templateUrl: './donor-form-modal.component.html',
  styleUrl: './donor-form-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DonorFormModalComponent {
  readonly form = input<DonorFormState>({ firstName: '', lastName: '', email: '', phone: '', address: '' });
  readonly mode = input<'add' | 'edit'>('add');
  readonly open = input(false);
  readonly closed = output();
  readonly confirmed = output<DonorFormState>();

  protected formData: DonorFormState = { firstName: '', lastName: '', email: '', phone: '', address: '' };

  ngOnChanges(): void {
    const f = this.form();
    this.formData = { ...f };
  }

  get canSave(): boolean {
    return !!this.formData.firstName.trim() && !!this.formData.lastName.trim() && !!this.formData.phone.trim();
  }

  get modalTitle(): string {
    return this.mode() === 'add' ? 'Add New Donor' : 'Edit Donor';
  }

  get confirmLabel(): string {
    return this.mode() === 'add' ? 'Create Donor' : 'Save Changes';
  }

  onConfirm(): void {
    this.confirmed.emit({ ...this.formData });
  }
}
