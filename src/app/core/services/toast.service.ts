import { Injectable, signal } from '@angular/core';
import { ToastModel } from '../models/domain.models';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<ToastModel[]>([]);
  readonly toasts = this._toasts.asReadonly();
  private id = 0;
  private timeoutIds = new Map<string, ReturnType<typeof setTimeout>>();

  show(type: ToastModel['type'], title: string, message = '', ms = 4000): void {
    const toast: ToastModel = { id: String(++this.id), type, title, message };
    this._toasts.update((l) => [...l, toast]);
    const timeoutId = setTimeout(() => this.dismiss(toast.id), ms);
    this.timeoutIds.set(toast.id, timeoutId);
  }

  success(title: string, message = ''): void {
    this.show('success', title, message);
  }
  error(title: string, message = ''): void {
    this.show('error', title, message);
  }
  warning(title: string, message = ''): void {
    this.show('warning', title, message);
  }
  info(title: string, message = ''): void {
    this.show('info', title, message);
  }

  dismiss(id: string): void {
    const timeoutId = this.timeoutIds.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeoutIds.delete(id);
    }
    this._toasts.update((l) => l.filter((t) => t.id !== id));
  }
}
