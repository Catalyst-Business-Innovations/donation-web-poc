import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { StoreStatusState } from '../../models/admin-dashboard.state';

@Component({
  selector: 'app-store-status-grid',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './store-status-grid.component.html',
  styleUrl: './store-status-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreStatusGridComponent {
  readonly stores = input.required<StoreStatusState[]>();
}
