import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'app-campaign-list-filters',
  standalone: true,
  imports: [FormsModule, IconComponent],
  templateUrl: './campaign-list-filters.component.html',
  styleUrl: './campaign-list-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignListFiltersComponent {
  readonly query = input.required<string>();
  readonly queryChanged = output<string>();
  readonly createClicked = output<void>();
}
