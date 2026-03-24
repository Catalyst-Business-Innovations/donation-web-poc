import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { DonorDetailState } from '../../models/donor-management.state';

@Component({
  selector: 'app-donor-detail-modal',
  standalone: true,
  imports: [DatePipe, DecimalPipe, ModalComponent, IconComponent],
  templateUrl: './donor-detail-modal.component.html',
  styleUrl: './donor-detail-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DonorDetailModalComponent {
  readonly donor = input<DonorDetailState | null>(null);
  readonly open = input(false);
  readonly closed = output();
  readonly editRequested = output();
}
