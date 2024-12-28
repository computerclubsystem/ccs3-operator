import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'sign-in',
    loadComponent: () => import('@ccs3-operator/sign-in').then(x => x.SignInComponent),
  },
];
