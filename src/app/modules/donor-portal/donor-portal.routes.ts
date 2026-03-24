import { Routes } from '@angular/router';
import { donorAuthGuard } from '../../core/guards/donor-auth.guard';

export const donorRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    data: { breadcrumb: 'Dashboard' },
    canActivate: [donorAuthGuard],
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard-page.component').then(m => m.DashboardPageComponent)
  },
  {
    path: 'history',
    data: { breadcrumb: 'My Donations' },
    canActivate: [donorAuthGuard],
    loadComponent: () =>
      import('./features/history/pages/history-page.component').then(m => m.HistoryPageComponent)
  },
  {
    path: 'receipts',
    data: { breadcrumb: 'Tax Receipts' },
    canActivate: [donorAuthGuard],
    loadComponent: () => import('./features/receipts/pages/receipts-page.component').then(m => m.ReceiptsPageComponent)
  },
  {
    path: 'rewards',
    data: { breadcrumb: 'Loyalty & Rewards' },
    canActivate: [donorAuthGuard],
    loadComponent: () => import('./features/rewards/pages/rewards-page.component').then(m => m.RewardsPageComponent)
  },
  {
    path: 'schedule',
    data: { breadcrumb: 'Schedule Donation' },
    canActivate: [donorAuthGuard],
    loadComponent: () => import('./features/schedule/pages/schedule-page.component').then(m => m.SchedulePageComponent)
  }
];
