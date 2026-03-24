import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'app-quick-actions-card',
  standalone: true,
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quick-actions-card.component.html',
  styleUrl: './quick-actions-card.component.scss',
})
export class QuickActionsCardComponent {
  findStoreClicked = output<void>();
}
