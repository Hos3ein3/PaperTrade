# TrackerPro Universal Trading Terminal (Angular Frontend)

Next-generation **Liquid Glass** multi-asset paper trading, Forex intelligence, and Cryptocurrency workstation built with **Angular 21** and **Tailwind CSS**.

---

## 🏛 Architecture & Engineering Design

This project follows **Vertical Slice Architecture (VSA)** and **Clean Architecture** principles to ensure enterprise scalability, high cohesion, and loose coupling.

```
src/
├── app/
│   ├── core/                          # Cross-cutting concerns & Clean Core
│   │   ├── url-builder/               # Fluent type-safe UrlBuilder (zero hardcoded strings)
│   │   │   ├── url-builder.ts         # Fluent URL builder with route param substitution
│   │   │   ├── api-endpoints.ts       # Mirror of AzureTest.API ApiRoutes.cs
│   │   │   └── url-builder.service.ts # Injectable Angular service with pre-configured baseUrl
│   │   ├── auth/                      # Authentication signals, token storage & guards
│   │   ├── interceptors/              # Auth (Bearer), Error (ProblemDetails/Toasts), Loading
│   │   ├── theme/                     # Liquid glass dark/light engine & accent palettes
│   │   ├── notifications/             # Signals-based Toast notifications & drawer service
│   │   └── pwa/                       # PWA install prompt & offline network detector
│   │
│   ├── shared/                        # Liquid Glass UI Kit
│   │   ├── components/                # GlassCard, GlassButton, GlassModal, GlassBadge, StatMetric
│   │   │                              # CandlestickChart (interactive SVG), OrderBook (depth bars)
│   │   └── pipes/                     # PnlFormatPipe, Currency formatting
│   │
│   ├── features/                      # Vertical Slices (VSA)
│   │   ├── auth/                      # Login, Register, Google OAuth, Forgot/Reset Password
│   │   ├── trading/                   # Universal Paper Trading (Hub, Terminal, Analytics, History)
│   │   ├── forex/                     # Forex Market Overview, Sessions, Trade Desk, Lot Size Calculator
│   │   ├── crypto/                    # Crypto Market, Coins, Perpetual Futures, Arbitrage, Portfolio & Alerts
│   │   ├── profile/                   # Personal Profile & Trader Workstation Preferences
│   │   └── notifications/             # Notification Drawer & WebSocket/Push trigger
│   │
│   ├── layout/                        # App Shell, Glass Navbar, Desktop Sidebar, Mobile Floating Nav
│   ├── app.component.ts               # Standalone root
│   ├── app.config.ts                  # Application configuration with interceptors & routing
│   └── app.routes.ts                  # Lazy-loaded route graph with auth & guest guards
│
├── environments/
│   ├── environment.model.ts           # Environment interface definition
│   ├── environment.ts                 # Local / Base environment
│   ├── environment.development.ts     # Dev environment configuration
│   └── environment.production.ts      # Production environment configuration
└── public/
    └── manifest.webmanifest          # PWA Web Manifest
```

---

## 🔗 Type-Safe UrlBuilder (Preventing Hardcoded URLs)

All API requests are constructed dynamically using the `UrlBuilder` class and `ApiEndpoints` registry, eliminating hardcoded strings across components and services:

```typescript
// Example: Querying a specific instrument quote
const url = this.urlBuilder
  .endpoint(this.urlBuilder.endpoints.Trading.Quote)
  .query('symbol', 'BTCUSDT')
  .build();
// => "http://localhost:5000/api/v1/trading/quote?symbol=BTCUSDT"

// Example: Deleting a crypto price alert with typed route constraint
const url = this.urlBuilder
  .endpoint(this.urlBuilder.endpoints.Crypto.DeleteAlert)
  .param('alertId', alertId)
  .build();
// => "http://localhost:5000/api/v1/crypto/alerts/3fa85f64-5717-4562-b3fc-2c963f66afa6"
```

---

## 🎨 Liquid Glass & Glassmorphic UI/UX

- **Frosted Blur Backdrop**: Dual-layer glass blur (`backdrop-blur-xl` and `backdrop-blur-md`) with specular highlight edge gradients.
- **Dynamic Dark / Light Themes**:
  - **Dark Mode**: Obsidian `#090d16` canvas with glowing teal (`#14b8a6`), emerald (`#10b981`), and rose (`#f43f5e`) accents.
  - **Light Mode**: High-contrast frosted crystalline finish.
- **Responsive Form Factors**:
  - **Mobile**: Floating bottom navigation bar, touch-friendly tap targets, off-canvas drawers.
  - **Tablet**: Split-view responsive multi-pane dashboard.
  - **Desktop**: Full-width multi-panel trading terminal (Interactive Candlestick Chart, Level 2 Order Book, Order Ticket, Active Positions Ledger).
- **PWA Ready**: Offline detection banner, `manifest.webmanifest`, app icon assets, mobile viewport optimization.

---

## 🚀 Running the Project

### Prerequisites
- Node.js `v20+` or `v24+`
- npm `v10+` or `v11+`
- Angular CLI `v21+`

### Development Server
```bash
cd front
npm start
```
Navigate to `http://localhost:4200/`.

### Run Unit Tests
```bash
npm test -- --no-watch
```

### Production Build
```bash
npm run build
```
Compiled production bundles will be written to `dist/azure-test-front`.
