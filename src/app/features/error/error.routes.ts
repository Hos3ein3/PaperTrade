import { Routes } from '@angular/router';

export const errorRoutes: Routes = [
  {
    path: '404',
    loadComponent: () =>
      import('./pages/error-page/error-page.component').then((m) => m.ErrorPageComponent),
    data: { code: 404 },
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./pages/error-page/error-page.component').then((m) => m.ErrorPageComponent),
    data: { code: 404 },
  },
  {
    path: '403',
    loadComponent: () =>
      import('./pages/error-page/error-page.component').then((m) => m.ErrorPageComponent),
    data: { code: 403 },
  },
  {
    path: 'forbidden',
    loadComponent: () =>
      import('./pages/error-page/error-page.component').then((m) => m.ErrorPageComponent),
    data: { code: 403 },
  },
  {
    path: '401',
    loadComponent: () =>
      import('./pages/error-page/error-page.component').then((m) => m.ErrorPageComponent),
    data: { code: 401 },
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./pages/error-page/error-page.component').then((m) => m.ErrorPageComponent),
    data: { code: 401 },
  },
  {
    path: '405',
    loadComponent: () =>
      import('./pages/error-page/error-page.component').then((m) => m.ErrorPageComponent),
    data: { code: 405 },
  },
  {
    path: 'not-allowed',
    loadComponent: () =>
      import('./pages/error-page/error-page.component').then((m) => m.ErrorPageComponent),
    data: { code: 405 },
  },
  {
    path: '500',
    loadComponent: () =>
      import('./pages/error-page/error-page.component').then((m) => m.ErrorPageComponent),
    data: { code: 500 },
  },
  {
    path: 'server-error',
    loadComponent: () =>
      import('./pages/error-page/error-page.component').then((m) => m.ErrorPageComponent),
    data: { code: 500 },
  },
  {
    path: '503',
    loadComponent: () =>
      import('./pages/error-page/error-page.component').then((m) => m.ErrorPageComponent),
    data: { code: 503 },
  },
  {
    path: 'service-unavailable',
    loadComponent: () =>
      import('./pages/error-page/error-page.component').then((m) => m.ErrorPageComponent),
    data: { code: 503 },
  },
  {
    path: ':code',
    loadComponent: () =>
      import('./pages/error-page/error-page.component').then((m) => m.ErrorPageComponent),
  },
  {
    path: '',
    redirectTo: '404',
    pathMatch: 'full',
  },
];
