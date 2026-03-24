import { Routes } from '@angular/router';

export const donorRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    data: { breadcrumb: 'Dashboard' },
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard-page.component').then(m => m.DashboardPageComponent),
  },
  {
    path: 'history',
    data: { breadcrumb: 'My Donations' },
    loadComponent: () =>
      import('./features/history/pages/history-page.component').then(m => m.HistoryPageComponent),
  },
  {
    path: 'receipts',
    data: { breadcrumb: 'Tax Receipts' },
    loadComponent: () =>
      import('./features/receipts/pages/receipts-page.component').then(m => m.ReceiptsPageComponent),
  },
  {
    path: 'rewards',
    data: { breadcrumb: 'Loyalty & Rewards' },
    loadComponent: () =>
      import('./features/rewards/pages/rewards-page.component').then(m => m.RewardsPageComponent),
  },
  {
    path: 'schedule',
    data: { breadcrumb: 'Schedule Donation' },
    loadComponent: () =>
      import('./features/schedule/pages/schedule-page.component').then(m => m.SchedulePageComponent),
  },
];
