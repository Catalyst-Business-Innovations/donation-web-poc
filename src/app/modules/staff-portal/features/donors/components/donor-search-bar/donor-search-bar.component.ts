import { ChangeDetectionStrategy, Component, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '@shared/components/icon/icon.component';
import { DonorTier } from '@core/models/domain.models';

@Component({
  selector: 'app-donor-search-bar',
  standalone: true,
  imports: [FormsModule, IconComponent],
  templateUrl: './donor-search-bar.component.html',
  styleUrl: './donor-search-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DonorSearchBarComponent {
  readonly query = model('');
  readonly tierFilter = model<DonorTier | ''>('');
  readonly exportRequested = output();
  readonly addRequested = output();

  protected readonly DT = DonorTier;
}
