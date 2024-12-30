import { Routes } from '@angular/router';

export enum RouteName {
  signIn = 'sign-in',
  notifications = 'notifications',
  computersStatus = 'computers-status',
  signedOutSessionStats = 'signed-out-session-stats',
}

export const routes: Routes = [
  {
    path: RouteName.signIn,
    loadComponent: () => import('@ccs3-operator/sign-in').then(x => x.SignInComponent),
  },
  {
    path: RouteName.notifications,
    loadComponent: () => import('@ccs3-operator/notifications').then(x => x.NotificationListComponent),
  },
  {
    path: RouteName.computersStatus,
    loadComponent: () => import('@ccs3-operator/computers-status').then(x => x.ComputersStatusComponent),
  },
  {
    path: RouteName.signedOutSessionStats,
    loadComponent: () => import('@ccs3-operator/signed-out-session-stats').then(x => x.SignedOutSessionStatsComponent),
  },
];
