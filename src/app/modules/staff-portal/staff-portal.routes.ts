import { Routes } from '@angular/router';

export const staffRoutes: Routes = [
  { path: '', redirectTo: 'new-donation', pathMatch: 'full' },

  // Staff Operations
  {
    path: 'new-donation',
    data: { breadcrumb: 'New Donation' },
    loadComponent: () =>
      import('./features/new-donation/pages/new-donation-page.component').then(m => m.NewDonationPageComponent)
  },

  {
    path: 'donations',
    data: { breadcrumb: 'Donations' },
    loadComponent: () =>
      import('./features/donations/pages/donations-page.component').then(m => m.DonationsPageComponent)
  },
  {
    path: 'presort',
    data: { breadcrumb: 'Presort' },
    loadComponent: () => import('./features/presort/pages/presort-page.component').then(m => m.PresortPageComponent)
  },
  {
    path: 'containers',
    data: { breadcrumb: 'Containers' },
    loadComponent: () =>
      import('./features/containers/pages/containers-page.component').then(m => m.ContainersPageComponent)
  },

  // Admin (merged)
  {
    path: 'dashboard',
    data: { breadcrumb: 'Dashboard' },
    loadComponent: () =>
      import('./features/admin-dashboard/pages/admin-dashboard-page.component').then(m => m.AdminDashboardPageComponent)
  },

  {
    path: 'donors',
    data: { breadcrumb: 'Donors' },
    loadComponent: () =>
      import('./features/donors/pages/donors-page.component').then(m => m.DonorsPageComponent)
  },
  {
    path: 'settings',
    data: { breadcrumb: 'Settings' },
    loadComponent: () => import('./features/settings/pages/settings-page.component').then(m => m.SettingsPageComponent)
  },
  {
    path: 'campaigns',
    data: { breadcrumb: 'Campaigns' },
    loadComponent: () =>
      import('./features/campaigns/pages/campaigns-page.component').then(m => m.CampaignsPageComponent)
  }
];
