import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';
import { AppLayoutComponent } from './layout/app-layout.component';

export const routes: Routes = [
  // Public Auth Routes
  {
    path: 'auth/login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'auth/forgot-password',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      ),
  },
  {
    path: 'auth/reset-password',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
  },
  {
    path: 'auth/google/callback',
    loadComponent: () =>
      import('./features/auth/pages/google-callback/google-callback.component').then(
        (m) => m.GoogleCallbackComponent
      ),
  },

  // Authenticated Application Shell Routes
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'trading',
        pathMatch: 'full',
      },
      // Universal Paper Trading Slices
      {
        path: 'trading',
        loadComponent: () =>
          import('./features/trading/pages/trading-hub/trading-hub.component').then(
            (m) => m.TradingHubComponent
          ),
      },
      {
        path: 'trading/trade',
        loadComponent: () =>
          import('./features/trading/pages/trading-terminal/trading-terminal.component').then(
            (m) => m.TradingTerminalComponent
          ),
      },
      {
        path: 'trading/analytics',
        loadComponent: () =>
          import('./features/trading/pages/trading-analytics/trading-analytics.component').then(
            (m) => m.TradingAnalyticsComponent
          ),
      },
      {
        path: 'trading/history',
        loadComponent: () =>
          import('./features/trading/pages/trading-history/trading-history.component').then(
            (m) => m.TradingHistoryComponent
          ),
      },

      // Forex Slices
      {
        path: 'forex/market',
        loadComponent: () =>
          import('./features/forex/pages/forex-market/forex-market.component').then(
            (m) => m.ForexMarketComponent
          ),
      },
      {
        path: 'forex/trade',
        loadComponent: () =>
          import('./features/forex/pages/forex-trade/forex-trade.component').then(
            (m) => m.ForexTradeComponent
          ),
      },

      // Crypto Slices
      {
        path: 'crypto/market',
        loadComponent: () =>
          import('./features/crypto/pages/crypto-market/crypto-market.component').then(
            (m) => m.CryptoMarketComponent
          ),
      },
      {
        path: 'crypto/portfolio',
        loadComponent: () =>
          import('./features/crypto/pages/crypto-portfolio/crypto-portfolio.component').then(
            (m) => m.CryptoPortfolioComponent
          ),
      },

      // Profile & Preferences
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/pages/profile-settings/profile-settings.component').then(
            (m) => m.ProfileSettingsComponent
          ),
      },

      // Administration & Telemetry
      {
        path: 'admin/outbox',
        loadComponent: () =>
          import('./features/outbox-admin/pages/outbox-admin/outbox-admin.component').then(
            (m) => m.OutboxAdminComponent
          ),
      },
      {
        path: 'admin/audit-log',
        loadComponent: () =>
          import('./features/audit-log/pages/audit-log/audit-log.component').then(
            (m) => m.AuditLogComponent
          ),
      },

      // Design System & UI Components Showcase
      {
        path: 'ui-components',
        loadComponent: () =>
          import('./features/ui-components/pages/ui-components/ui-components.component').then(
            (m) => m.UiComponentsComponent
          ),
      },
    ],
  },

  // Public Error Pages
  {
    path: 'error',
    loadChildren: () => import('./features/error/error.routes').then((m) => m.errorRoutes),
  },

  // Fallback Wildcard -> 404 Not Found Page
  {
    path: '**',
    loadComponent: () =>
      import('./features/error/pages/error-page/error-page.component').then(
        (m) => m.ErrorPageComponent
      ),
    data: { code: 404 },
  },
];
