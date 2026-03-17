import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  DonorLayoutComponent,
  DonorNavSection as NavSection
} from '../../shared/components/donor-layout/donor-layout.component';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-donor-portal',
  standalone: true,
  imports: [RouterOutlet, DonorLayoutComponent],
  template: `
    <app-donor-layout
      moduleLabel="Donor Portal"
      [sections]="sections"
      [userName]="donor.firstName + ' ' + donor.lastName"
      [userInitials]="svc.getInitials(donor.firstName, donor.lastName)"
      [userRole]="tierCfg.icon + ' ' + tierCfg.label + ' Member'"
      logoutRoute="/donor/login"
    >
      <router-outlet />
    </app-donor-layout>
  `
})
export class DonorPortalComponent {
  protected svc = inject(MockDataService);
  protected donor = this.svc.donors[0];
  protected tierCfg = this.svc.getTier(this.donor.loyaltyTier);
  readonly sections: NavSection[] = [
    {
      title: '',
      items: [
        { label: 'Dashboard', icon: 'home', route: '/donor/dashboard' },
        { label: 'My Donations', icon: 'list', route: '/donor/history' },
        { label: 'Tax Receipts', icon: 'file-text', route: '/donor/receipts' },
        { label: 'Loyalty & Rewards', icon: 'star', route: '/donor/rewards' },
        {
          label: 'Schedule Donation',
          icon: 'calendar',
          route: '/donor/schedule'
        }
      ]
    }
  ];
}
