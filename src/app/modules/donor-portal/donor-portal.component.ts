import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  DonorLayoutComponent,
  DonorNavSection as NavSection,
} from '../../shared/components/donor-layout/donor-layout.component';
import { CurrentUserService } from '../../core/services/current-user.service';

@Component({
  selector: 'app-donor-portal',
  standalone: true,
  imports: [RouterOutlet, DonorLayoutComponent],
  template: `
    <app-donor-layout
      moduleLabel="Donor Portal"
      [sections]="sections"
      logoutRoute="/donor/login"
    >
      <router-outlet />
    </app-donor-layout>
  `,
})
export class DonorPortalComponent implements OnInit {
  private readonly currentUser = inject(CurrentUserService);

  readonly sections: NavSection[] = [
    {
      title: '',
      items: [
        { label: 'Dashboard', icon: 'home', route: '/donor/dashboard' },
        { label: 'My Donations', icon: 'list', route: '/donor/history' },
        { label: 'Tax Receipts', icon: 'file-text', route: '/donor/receipts' },
        { label: 'Loyalty & Rewards', icon: 'star', route: '/donor/rewards' },
        { label: 'Schedule Donation', icon: 'calendar', route: '/donor/schedule' },
      ],
    },
  ];

  ngOnInit(): void {
    this.currentUser.setPortal('donor');
  }
}
