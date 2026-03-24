import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { SettingsTab } from '../../models/settings.enum';

@Component({
  selector: 'app-settings-tab-bar',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './settings-tab-bar.component.html',
  styleUrl: './settings-tab-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsTabBarComponent {
  readonly activeTab = input.required<SettingsTab>();
  readonly tabChanged = output<SettingsTab>();
}
