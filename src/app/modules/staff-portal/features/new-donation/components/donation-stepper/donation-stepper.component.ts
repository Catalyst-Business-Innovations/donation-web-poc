import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { StepDefinition } from '../../models/new-donation.state';

@Component({
  selector: 'app-donation-stepper',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './donation-stepper.component.html',
  styleUrl: './donation-stepper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DonationStepperComponent {
  readonly steps = input.required<StepDefinition[]>();
  readonly currentStep = input.required<number>();
}
