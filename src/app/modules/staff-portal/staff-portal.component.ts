import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StaffLayoutComponent, StaffNavSection } from '../../shared/components/staff-layout/staff-layout.component';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-staff-portal',
  standalone: true,
  imports: [RouterOutlet, StaffLayoutComponent],
  template: `
    <app-staff-layout
      moduleLabel="Staff Portal"
      [sections]="sections"
      [userName]="svc.session.staffName"
      [userInitials]="initials"
      userRole="Donation Attendant"
      [storeName]="svc.session.locationName"
      logoutRoute="/staff/login"
    >
      <router-outlet />
    </app-staff-layout>
  `
})
export class StaffPortalComponent {
  protected svc = inject(MockDataService);
  readonly initials = this.svc.session.staffName
    .split(' ')
    .map(n => n[0])
    .join('');
  readonly sections: StaffNavSection[] = [
    {
      title: 'Operations',
      items: [
        { label: 'New Donation', icon: 'package', route: '/staff/new-donation' },
        { label: 'Donor Lookup', icon: 'search', route: '/staff/lookup' },
        { label: 'Donations', icon: 'calendar', route: '/staff/donations' },
        { label: 'Presort', icon: 'list', route: '/staff/presort', badge: 3 }
      ]
    },
    {
      title: 'Reporting',
      items: [
        { label: 'Dashboard', icon: 'grid', route: '/staff/dashboard' },
        { label: 'Daily Reports', icon: 'bar-chart', route: '/staff/reports' },
        { label: 'Analytics', icon: 'trending-up', route: '/staff/analytics' }
      ]
    },
    {
      title: 'Admin',
      items: [
        { label: 'Containers', icon: 'layers', route: '/staff/containers' },
        { label: 'Donors', icon: 'users', route: '/staff/donors' },
        { label: 'Campaigns', icon: 'send', route: '/staff/campaigns' },
        { label: 'Settings', icon: 'settings', route: '/staff/settings' }
      ]
    }
  ];
}
