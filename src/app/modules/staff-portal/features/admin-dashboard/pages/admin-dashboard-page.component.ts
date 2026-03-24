import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '@core/services/toast.service';
import { AdminDashboardService } from '../services/admin-dashboard.service';
import { MetricsGridComponent } from '../components/metrics-grid/metrics-grid.component';
import { TrendChartComponent } from '../components/trend-chart/trend-chart.component';
import { CategoryDonutComponent } from '../components/category-donut/category-donut.component';
import { StoreStatusGridComponent } from '../components/store-status-grid/store-status-grid.component';
import { RecentDonationsTableComponent } from '../components/recent-donations-table/recent-donations-table.component';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [
    MetricsGridComponent,
    TrendChartComponent,
    CategoryDonutComponent,
    StoreStatusGridComponent,
    RecentDonationsTableComponent
  ],
  templateUrl: './admin-dashboard-page.component.html',
  styleUrl: './admin-dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardPageComponent {
  private readonly dashboardService = inject(AdminDashboardService);
  protected readonly toast = inject(ToastService);

  readonly metrics = this.dashboardService.getMetrics();
  readonly trends = this.dashboardService.getTrends();
  readonly donutSegments = this.dashboardService.getDonutSegments();
  readonly categoryBreakdown = this.dashboardService.getCategoryBreakdown();
  readonly storeStatuses = this.dashboardService.getStoreStatuses();
  readonly recentDonations = this.dashboardService.getRecentDonations();
  readonly totalDonations = this.dashboardService.getTotalDonations();

  onFilterClick(): void {
    this.toast.info('Filter', 'Showing last 30 days');
  }

  onExportClick(): void {
    this.toast.success('Export', 'Report generating...');
  }
}
