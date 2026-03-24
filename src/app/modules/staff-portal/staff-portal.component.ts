import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StaffLayoutComponent, StaffNavSection } from '../../shared/components/staff-layout/staff-layout.component';
import { CurrentUserService } from '../../core/services/current-user.service';

@Component({
  selector: 'app-staff-portal',
  standalone: true,
  imports: [RouterOutlet, StaffLayoutComponent],
  template: `
    <app-staff-layout
      moduleLabel="Staff Portal"
      [sections]="sections"
      logoutRoute="/staff/login"
    >
      <router-outlet />
    </app-staff-layout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaffPortalComponent implements OnInit {
  protected currentUser = inject(CurrentUserService);

  readonly sections: StaffNavSection[] = [
    {
      title: 'Operations',
      items: [
        { label: 'New Donation', icon: 'package', route: '/staff/new-donation' },
        { label: 'Donations', icon: 'calendar', route: '/staff/donations' },
        { label: 'Donors', icon: 'users', route: '/staff/donors' },
        { label: 'Presort', icon: 'list', route: '/staff/presort', badge: 3 },
      ],
    },
    {
      title: 'Reporting',
      items: [{ label: 'Dashboard', icon: 'grid', route: '/staff/dashboard' }],
    },
    {
      title: 'Admin',
      items: [
        { label: 'Containers', icon: 'layers', route: '/staff/containers' },
        { label: 'Campaigns', icon: 'send', route: '/staff/campaigns' },
        { label: 'Settings', icon: 'settings', route: '/staff/settings' },
      ],
    },
  ];

  ngOnInit(): void {
    this.currentUser.setPortal('staff');
  }
}
