import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { MockDataService } from '../../../../../core/services/mock-data.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { DonorDashboardMapper } from '../models/donor-dashboard.models';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-donor-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DatePipe, IconComponent],
  templateUrl: './donor-dashboard.component.html',
  styleUrl: './donor-dashboard.component.scss'
})
export class DonorDashboardComponent {
  protected svc = inject(MockDataService);
  protected toast = inject(ToastService);
  protected donor = this.svc.donors[0];
  protected tier = this.svc.getTier(this.donor.loyaltyTier);

  get nextTier() {
    const idx = this.svc.loyaltyTiers.findIndex(t => t.tier === this.donor.loyaltyTier);
    return idx < this.svc.loyaltyTiers.length - 1 ? this.svc.loyaltyTiers[idx + 1] : null;
  }
  get tierProgress(): number {
    return DonorDashboardMapper.tierProgress(this.donor.totalDonations, this.tier, this.nextTier);
  }
  get donationsToNext(): number {
    return this.nextTier ? this.nextTier.minDonations - this.donor.totalDonations : 0;
  }

  readonly impact = DonorDashboardMapper.impactItems(this.donor.totalDonations, this.donor.lifetimeValue);

  readonly badges = [
    { icon: 'star' as const, label: 'First Donation', earned: true },
    { icon: 'list' as const, label: '10 Donations', earned: this.donor.totalDonations >= 10 },
    { icon: 'check-circle' as const, label: '25 Donations', earned: this.donor.totalDonations >= 25 },
    { icon: 'trending-up' as const, label: '50 Donations', earned: this.donor.totalDonations >= 50 },
    { icon: 'users' as const, label: 'Community Hero', earned: this.donor.lifetimeValue >= 5000 },
    { icon: 'calendar' as const, label: 'Year-Round Donor', earned: false }
  ];
}
