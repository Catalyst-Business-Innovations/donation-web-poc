import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  effect,
  inject,
  ElementRef,
  DestroyRef,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  open = input(false);
  title = input('');
  confirmLabel = input('Save');
  cancelLabel = input('Cancel');
  confirmVariant = input('primary');
  showFooter = input(true);
  showCancel = input(true);
  confirmDisabled = input(false);
  size = input<'sm' | 'md' | 'lg'>('md');

  closed = output<void>();
  confirmed = output<void>();

  private readonly document = inject(DOCUMENT);
  private readonly elRef = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private previouslyFocusedElement: HTMLElement | null = null;
  private boundKeyHandler = this.onKeydown.bind(this);

  constructor() {
    effect(() => {
      if (this.open()) {
        this.onOpen();
      } else {
        this.onClose();
      }
    });

    this.destroyRef.onDestroy(() => {
      this.document.removeEventListener('keydown', this.boundKeyHandler);
      this.document.body.style.overflow = '';
    });
  }

  onOverlayClick(e: MouseEvent): void {
    if (e.target === e.currentTarget) this.closed.emit();
  }

  private onOpen(): void {
    this.previouslyFocusedElement = this.document.activeElement as HTMLElement;
    this.document.addEventListener('keydown', this.boundKeyHandler);
    this.document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      const modal = this.elRef.nativeElement.querySelector('.modal') as HTMLElement;
      if (modal) {
        const focusable = modal.querySelector<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        focusable?.focus();
      }
    });
  }

  private onClose(): void {
    this.document.removeEventListener('keydown', this.boundKeyHandler);
    this.document.body.style.overflow = '';
    this.previouslyFocusedElement?.focus();
    this.previouslyFocusedElement = null;
  }

  private onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closed.emit();
      return;
    }

    if (event.key === 'Tab') {
      this.trapFocus(event);
    }
  }

  private trapFocus(event: KeyboardEvent): void {
    const modal = this.elRef.nativeElement.querySelector('.modal') as HTMLElement;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length === 0) return;

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (this.document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (this.document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }
  }
}
