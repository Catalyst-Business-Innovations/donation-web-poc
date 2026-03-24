import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { RewardFormState, RewardTypeOption } from '../../models/settings.state';
import { RewardModalMode } from '../../models/settings.enum';

@Component({
  selector: 'app-reward-form-modal',
  standalone: true,
  imports: [FormsModule, ModalComponent],
  templateUrl: './reward-form-modal.component.html',
  styleUrl: './reward-form-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RewardFormModalComponent {
  readonly modalMode = input.required<RewardModalMode>();
  readonly form = input.required<RewardFormState>();
  readonly rewardTypes = input.required<RewardTypeOption[]>();

  readonly closed = output<void>();
  readonly confirmed = output<RewardFormState>();

  protected localForm!: RewardFormState;

  ngOnChanges(): void {
    this.localForm = { ...this.form() };
  }

  protected get isOpen(): boolean {
    return this.modalMode() !== null;
  }

  protected get title(): string {
    return this.modalMode() === 'add-reward' ? 'Add Reward' : 'Edit Reward';
  }

  protected get confirmLabel(): string {
    return this.modalMode() === 'add-reward' ? 'Create Reward' : 'Save Changes';
  }

  protected onConfirm(): void {
    if (!this.localForm.name.trim()) return;
    this.confirmed.emit({ ...this.localForm });
  }
}
