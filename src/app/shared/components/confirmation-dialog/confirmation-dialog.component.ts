import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss'],
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmationDialogComponent {
  readonly title = input('Confirm');
  readonly message = input('Are you sure?');
  readonly confirmText = input('Yes');
  readonly cancelText = input('No');
  readonly confirmButtonClass = input('btn-primary');
  readonly isVisible = input(false);
  readonly showTextarea = input(false);
  readonly textareaLabel = input('');
  readonly textareaPlaceholder = input('');
  readonly textareaValue = input('');
  readonly textareaRequired = input(false);

  readonly confirmed = output<string | void>();
  readonly cancelled = output<void>();
  readonly textareaValueChange = output<string>();

  protected textareaModel = '';

  protected isConfirmDisabled = computed(() => {
    return this.textareaRequired() && this.showTextarea() && !this.textareaModel.trim();
  });

  onTextareaChange(value: string): void {
    this.textareaModel = value;
    this.textareaValueChange.emit(value);
  }

  onConfirm(): void {
    if (this.showTextarea()) {
      this.confirmed.emit(this.textareaModel);
    } else {
      this.confirmed.emit();
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.onCancel();
    }
  }
}
