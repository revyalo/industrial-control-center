import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'machines',
    loadComponent: () => import('./features/machines/machines').then((m) => m.Machines),
  },
  { path: 'alerts', loadComponent: () => import('./features/alerts/alerts').then((m) => m.Alerts) },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings').then((m) => m.Settings),
  },
  {
    path: 'telemetry',
    loadComponent: () => import('./features/telemetry/telemetry').then((m) => m.Telemetry),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'foundation',
    loadComponent: () =>
      import('./features/foundation/machine-dashboard').then((m) => m.MachineDashboard),
  },
  { path: '**', redirectTo: 'dashboard' },
];
