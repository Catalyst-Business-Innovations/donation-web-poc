import { Routes } from '@angular/router';

export const staffRoutes: Routes = [
  { path: '', redirectTo: 'new-donation', pathMatch: 'full' },

  // Staff Operations
  {
    path: 'new-donation',
    data: { breadcrumb: 'New Donation' },
    loadComponent: () =>
      import('./features/new-donation/components/new-donation.component').then(m => m.NewDonationComponent)
  },
  {
    path: 'lookup',
    data: { breadcrumb: 'Donor Lookup' },
    loadComponent: () =>
      import('./features/donor-lookup/components/donor-lookup.component').then(m => m.DonorLookupComponent)
  },
  {
    path: 'donations',
    data: { breadcrumb: 'Donations' },
    loadComponent: () =>
      import('./features/donations/components/donations.component').then(m => m.DonationsComponent)
  },
  {
    path: 'presort',
    data: { breadcrumb: 'Presort' },
    loadComponent: () => import('./features/presort/components/presort.component').then(m => m.PresortComponent)
  },
  {
    path: 'containers',
    data: { breadcrumb: 'Containers' },
    loadComponent: () =>
      import('./features/containers/components/containers.component').then(m => m.ContainersComponent)
  },
  {
    path: 'reports',
    data: { breadcrumb: 'Daily Reports' },
    loadComponent: () => import('./features/reports/components/reports.component').then(m => m.ReportsComponent)
  },

  // Admin (merged)
  {
    path: 'dashboard',
    data: { breadcrumb: 'Dashboard' },
    loadComponent: () =>
      import('./features/admin-dashboard/components/admin-dashboard.component').then(m => m.AdminDashboardPageComponent)
  },
  {
    path: 'analytics',
    data: { breadcrumb: 'Analytics' },
    loadComponent: () => import('./features/analytics/components/analytics.component').then(m => m.AnalyticsComponent)
  },
  {
    path: 'donors',
    data: { breadcrumb: 'Donors' },
    loadComponent: () =>
      import('./features/donor-management/components/donor-management.component').then(m => m.DonorManagementComponent)
  },
  {
    path: 'settings',
    data: { breadcrumb: 'Settings' },
    loadComponent: () => import('./features/settings/components/settings.component').then(m => m.SettingsComponent)
  },
  {
    path: 'campaigns',
    data: { breadcrumb: 'Campaigns' },
    loadComponent: () => import('./features/campaigns/components/campaigns.component').then(m => m.CampaignsComponent)
  }
];
