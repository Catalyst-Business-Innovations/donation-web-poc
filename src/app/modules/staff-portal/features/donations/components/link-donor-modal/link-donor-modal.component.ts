import { ChangeDetectionStrategy, Component, input, output, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { CompletedDonationState, DonorSearchResultState } from '../../models/donations.state';

@Component({
  selector: 'app-link-donor-modal',
  standalone: true,
  imports: [FormsModule, DatePipe, DecimalPipe, ModalComponent, IconComponent],
  templateUrl: './link-donor-modal.component.html',
  styleUrl: './link-donor-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkDonorModalComponent {
  readonly donation = input.required<CompletedDonationState | null>();
  readonly searchResults = input.required<DonorSearchResultState[]>();
  readonly searchQuery = model('');
  readonly closed = output<void>();
  readonly confirmed = output<number>();

  protected selectedDonorId: number | null = null;

  selectDonor(id: number): void {
    this.selectedDonorId = id;
  }

  onConfirm(): void {
    if (this.selectedDonorId != null) {
      this.confirmed.emit(this.selectedDonorId);
      this.selectedDonorId = null;
    }
  }

  onClose(): void {
    this.selectedDonorId = null;
    this.closed.emit();
  }
}
