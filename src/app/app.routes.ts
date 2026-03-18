import { Routes } from '@angular/router';
import { staffTokenGuard } from './core/guards/staff-token.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./modules/home/components/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'staff/login',
    loadComponent: () =>
      import('./modules/staff-portal/features/login/components/staff-login.component').then(m => m.StaffLoginComponent)
  },
  {
    path: 'staff',
    canActivate: [staffTokenGuard],
    loadComponent: () => import('./modules/staff-portal/staff-portal.component').then(m => m.StaffPortalComponent),
    loadChildren: () => import('./modules/staff-portal/staff-portal.routes').then(m => m.staffRoutes)
  },
  {
    path: 'admin',
    redirectTo: 'staff',
    pathMatch: 'prefix'
  },
  {
    path: 'donor/login',
    loadComponent: () =>
      import('./modules/donor-portal/features/login/components/donor-login.component').then(m => m.DonorLoginComponent)
  },
  {
    path: 'donor',
    loadComponent: () => import('./modules/donor-portal/donor-portal.component').then(m => m.DonorPortalComponent),
    loadChildren: () => import('./modules/donor-portal/donor-portal.routes').then(m => m.donorRoutes)
  },
  {
    path: 'terminal-simulator',
    loadComponent: () =>
      import('./modules/staff-portal/features/new-donation/components/terminal-simulator.component').then(m => m.TerminalSimulatorComponent)
  },
  { path: '**', redirectTo: '' }
];
