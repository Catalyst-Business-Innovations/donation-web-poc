import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DonationTab } from '../../models/donations.enum';

@Component({
  selector: 'app-donations-tab-bar',
  standalone: true,
  templateUrl: './donations-tab-bar.component.html',
  styleUrl: './donations-tab-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DonationsTabBarComponent {
  readonly activeTab = input.required<DonationTab>();
  readonly tabChanged = output<DonationTab>();
}
