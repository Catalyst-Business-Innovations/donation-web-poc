import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { ToastModel } from '../../../core/models/domain.models';
import { IconComponent, IconName } from '../icon/icon.component';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastContainerComponent {
  protected svc = inject(ToastService);

  icon(type: ToastModel['type']): IconName {
    const icons: Record<ToastModel['type'], IconName> = { success: 'check-circle', error: 'x-circle', warning: 'alert-circle', info: 'info' };
    return icons[type] ?? ('info' as IconName);
  }
}
