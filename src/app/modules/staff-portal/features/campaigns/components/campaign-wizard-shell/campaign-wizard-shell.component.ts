import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { WizardStepState } from '../../models/campaigns.state';
import { WizardIntent } from '../../models/campaigns.enum';

@Component({
  selector: 'app-campaign-wizard-shell',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './campaign-wizard-shell.component.html',
  styleUrl: './campaign-wizard-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignWizardShellComponent {
  readonly wizardTitle = input.required<string>();
  readonly wizardIntent = input.required<WizardIntent>();
  readonly wizardSteps = input.required<WizardStepState[]>();
  readonly currentStep = input.required<number>();
  readonly currentStepIndex = input.required<number>();
  readonly isFirstStep = input.required<boolean>();
  readonly isLastStep = input.required<boolean>();
  readonly isViewMode = input.required<boolean>();
  readonly canProceedStep1 = input.required<boolean>();
  readonly stepProgress = input.required<string>();
  readonly visibleStepNums = input.required<number[]>();

  readonly stepClicked = output<number>();
  readonly nextClicked = output<void>();
  readonly prevClicked = output<void>();
  readonly closeClicked = output<void>();
  readonly saveClicked = output<void>();
  readonly switchToEditClicked = output<void>();

  get intentBadgeClass(): string {
    const intent = this.wizardIntent();
    if (intent === 'add') return 'intent-badge-create';
    if (intent === 'edit') return 'intent-badge-edit';
    return 'intent-badge-view';
  }

  get intentBadgeLabel(): string {
    const intent = this.wizardIntent();
    if (intent === 'add') return 'Creating';
    if (intent === 'edit') return 'Editing';
    return 'Viewing';
  }

  get saveButtonLabel(): string {
    return this.wizardIntent() === 'add' ? 'Create Campaign' : 'Save Changes';
  }
}
