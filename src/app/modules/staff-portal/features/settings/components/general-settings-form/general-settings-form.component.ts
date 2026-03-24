import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '@shared/components/icon/icon.component';
import { SystemRulesState } from '../../models/settings.state';

@Component({
  selector: 'app-general-settings-form',
  standalone: true,
  imports: [FormsModule, IconComponent],
  templateUrl: './general-settings-form.component.html',
  styleUrl: './general-settings-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneralSettingsFormComponent {
  readonly rules = input.required<SystemRulesState>();
  readonly saved = output<SystemRulesState>();

  protected localRules!: SystemRulesState;

  ngOnChanges(): void {
    this.localRules = { ...this.rules() };
  }

  protected save(): void {
    this.saved.emit({ ...this.localRules });
  }
}
