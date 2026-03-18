import { Component, inject } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { MockDataService } from '../../../../../core/services/mock-data.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { AdminDashboardMapper } from '../models/admin-dashboard.models';
import { DonationStatus, DonationStatusLabel } from '../../../../../core/models/domain.models';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [DecimalPipe, DatePipe, IconComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardPageComponent {
  protected svc = inject(MockDataService);
  protected toast = inject(ToastService);
  readonly a = this.svc.analytics;
  readonly maxT = Math.max(...this.a.trends.map(t => t.count));
  readonly donut = AdminDashboardMapper.donutSegments(this.a.categoryBreakdown);
  protected readonly DS = DonationStatus;
  protected readonly DSL = DonationStatusLabel;
}
