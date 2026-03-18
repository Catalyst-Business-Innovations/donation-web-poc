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


  // Admin (merged)
  {
    path: 'dashboard',
    data: { breadcrumb: 'Dashboard' },
    loadComponent: () =>
      import('./features/admin-dashboard/components/admin-dashboard.component').then(m => m.AdminDashboardPageComponent)
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
