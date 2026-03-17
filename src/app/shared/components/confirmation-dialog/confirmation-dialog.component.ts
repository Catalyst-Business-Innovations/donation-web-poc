import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ConfirmationDialogComponent {
  @Input() title: string = 'Confirm';
  @Input() message: string = 'Are you sure?';
  @Input() confirmText: string = 'Yes';
  @Input() cancelText: string = 'No';
  @Input() confirmButtonClass: string = 'btn-primary';
  @Input() isVisible: boolean = false;
  @Input() showTextarea: boolean = false;
  @Input() textareaLabel: string = '';
  @Input() textareaPlaceholder: string = '';
  @Input() textareaValue: string = '';
  @Input() textareaRequired: boolean = false;

  @Output() confirmed = new EventEmitter<string | void>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() textareaValueChange = new EventEmitter<string>();

  get isConfirmDisabled(): boolean {
    return this.textareaRequired && this.showTextarea && !this.textareaValue.trim();
  }

  onConfirm(): void {
    if (this.showTextarea) {
      this.confirmed.emit(this.textareaValue);
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
}
