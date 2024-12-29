import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'sign-in',
    loadComponent: () => import('@ccs3-operator/sign-in').then(x => x.SignInComponent),
  },
  {
    path: 'notifications',
    loadComponent: () => import('@ccs3-operator/notifications').then(x => x.NotificationListComponent),
  },
];
