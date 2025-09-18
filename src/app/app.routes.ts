import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/top/top.component').then(m => m.TopComponent)
  },
  {
    path:'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'settlement',
    loadComponent: () => import('./pages/settlement/settlement.component').then(m => m.SettlementComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
