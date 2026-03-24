import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { DonationScope } from '@core/models/domain.models';
import { SelectedDonor } from '../../models/new-donation.state';

@Component({
  selector: 'app-donation-type-step',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './donation-type-step.component.html',
  styleUrl: './donation-type-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DonationTypeStepComponent {
  readonly donor = input.required<SelectedDonor | null | undefined>();
  readonly donationType = input.required<DonationScope | null>();

  readonly typeSelected = output<DonationScope>();

  protected readonly DT = DonationScope;

  protected onSelectType(t: DonationScope): void {
    this.typeSelected.emit(t);
  }
}
