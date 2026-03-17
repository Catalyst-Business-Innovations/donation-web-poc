import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() confirmLabel = 'Save';
  @Input() cancelLabel = 'Cancel';
  @Input() confirmText = ''; // Alias for confirmLabel
  @Input() cancelText = ''; // Alias for cancelLabel
  @Input() confirmVariant = 'primary';
  @Input() showFooter = true;
  @Input() showCancel = true;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  get effectiveConfirmLabel(): string {
    return this.confirmText || this.confirmLabel;
  }

  get effectiveCancelLabel(): string {
    return this.cancelText || this.cancelLabel;
  }

  onOverlayClick(e: MouseEvent): void {
    if (e.target === e.currentTarget) this.closed.emit();
  }
}
