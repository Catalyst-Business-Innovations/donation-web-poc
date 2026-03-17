import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { ToastModel } from '../../../core/models/domain.models';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss'
})
export class ToastContainerComponent {
  protected svc = inject(ToastService);

  icon(type: ToastModel['type']): string {
    const icons: Record<ToastModel['type'], string> = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    return icons[type] ?? 'ℹ️';
  }
}
