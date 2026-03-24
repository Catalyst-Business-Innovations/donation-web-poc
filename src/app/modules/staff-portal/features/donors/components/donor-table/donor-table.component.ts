import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { IconComponent } from '@shared/components/icon/icon.component';
import { DonorListItemState } from '../../models/donor-management.state';

@Component({
  selector: 'app-donor-table',
  standalone: true,
  imports: [DatePipe, DecimalPipe, IconComponent],
  templateUrl: './donor-table.component.html',
  styleUrl: './donor-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DonorTableComponent {
  readonly donors = input.required<DonorListItemState[]>();
  readonly totalCount = input(0);
  readonly viewRequested = output<number>();
  readonly editRequested = output<number>();
}
