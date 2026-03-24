import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '@core/services/toast.service';
import { DonorDashboardService } from '../services/donor-dashboard.service';
import { LoyaltyHeroComponent } from '../components/loyalty-hero/loyalty-hero.component';
import { ActiveCampaignsListComponent } from '../components/active-campaigns-list/active-campaigns-list.component';
import { RecentDonationsCardComponent } from '../components/recent-donations-card/recent-donations-card.component';
import { ImpactSummaryComponent } from '../components/impact-summary/impact-summary.component';
import { QuickActionsCardComponent } from '../components/quick-actions-card/quick-actions-card.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    RouterLink,
    LoyaltyHeroComponent,
    ActiveCampaignsListComponent,
    RecentDonationsCardComponent,
    ImpactSummaryComponent,
    QuickActionsCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
})
export class DashboardPageComponent {
  private readonly dashboardService = inject(DonorDashboardService);
  private readonly toast = inject(ToastService);

  protected readonly donorStats = this.dashboardService.getDonorStats();
  protected readonly tierDisplay = this.dashboardService.getTierDisplay();
  protected readonly impactItems = this.dashboardService.getImpactItems();
  protected readonly recentDonations = this.dashboardService.getRecentDonations();
  protected readonly activeCampaigns = this.dashboardService.activeCampaigns;

  onFindStore(): void {
    this.toast.info('Finder', 'Opening store finder...');
  }
}
