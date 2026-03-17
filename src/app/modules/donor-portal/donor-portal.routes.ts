import { Routes } from '@angular/router';
import { donorAuthGuard } from '../../core/guards/donor-auth.guard';

export const donorRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    data: { breadcrumb: 'Dashboard' },
    canActivate: [donorAuthGuard],
    loadComponent: () =>
      import('./features/dashboard/components/donor-dashboard.component').then(m => m.DonorDashboardComponent)
  },
  {
    path: 'history',
    data: { breadcrumb: 'My Donations' },
    canActivate: [donorAuthGuard],
    loadComponent: () =>
      import('./features/history/components/donation-history.component').then(m => m.DonationHistoryComponent)
  },
  {
    path: 'receipts',
    data: { breadcrumb: 'Tax Receipts' },
    canActivate: [donorAuthGuard],
    loadComponent: () => import('./features/receipts/components/receipts.component').then(m => m.ReceiptsComponent)
  },
  {
    path: 'rewards',
    data: { breadcrumb: 'Loyalty & Rewards' },
    canActivate: [donorAuthGuard],
    loadComponent: () => import('./features/rewards/components/rewards.component').then(m => m.RewardsComponent)
  },
  {
    path: 'schedule',
    data: { breadcrumb: 'Schedule Donation' },
    canActivate: [donorAuthGuard],
    loadComponent: () => import('./features/schedule/components/schedule.component').then(m => m.ScheduleComponent)
  }
];
