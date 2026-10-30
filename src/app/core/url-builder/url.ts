import { environment } from '../../../environments/environment';
import { UrlBuilder } from './url-builder';

/**
 * Type-safe Url catalog and builder factory based directly on AzureTest.API ApiRoutes.cs.
 * Concat and interpolates paths, route parameters, and query parameters dynamically.
 */
export class Url {
  public static readonly Auth = {
    Login: 'auth/login',
    Register: 'auth/register',
    Logout: 'auth/logout',
    RefreshToken: 'auth/refresh-token',
    ForgotPassword: 'auth/forgot-password',
    ResetPassword: 'auth/reset-password',
    ConfirmEmail: 'auth/confirm-email',
    ChangePassword: 'auth/change-password',
    Google: 'auth/google',
  } as const;

  public static readonly Trading = {
    Dashboard: 'trading/dashboard',
    Terminal: 'trading/terminal',
    Analytics: 'trading/analytics',
    History: 'trading/history',
    Quote: 'trading/quote',
    Quotes: 'trading/quotes',
    LiveStatus: 'trading/live-status',
    Search: 'trading/search',
    PlaceOrder: 'trading/order',
    ClosePosition: 'trading/position/close',
    ModifyPosition: 'trading/position/modify',
    CancelOrder: 'trading/order/cancel',
    ResetBalance: 'trading/account/reset',
    WatchlistToggle: 'trading/watchlist/toggle',
    ExecuteJson: 'trading/execute',
  } as const;

  public static readonly Forex = {
    Settings: 'forex/settings',
    MarketOverview: 'forex/market',
    Chart: 'forex/market/chart',
    Sessions: 'forex/market/sessions',
    Strategies: 'forex/strategies',
    BacktestExecute: 'forex/strategies/backtest',
    BacktestResults: 'forex/strategies/backtest/results/{id:guid}',
    Analysis: 'forex/analysis',
    Technical: 'forex/analysis/technical',
    Strength: 'forex/analysis/strength',
    Fundamental: 'forex/analysis/fundamental',
    Journal: 'forex/portfolio/journal',
    SaveJournalEntry: 'forex/portfolio/journal',
    ExportTax: 'forex/portfolio/tax/export',
    RiskOverview: 'forex/risk',
    CalculateLotSize: 'forex/risk/calculate-lot-size',
    TradeDashboard: 'forex/trade',
    PlaceOrder: 'forex/trade/order',
    CloseTrade: 'forex/trade/close',
    CancelOrder: 'forex/trade/cancel',
    UpdateStops: 'forex/trade/stops',
    PartialClose: 'forex/trade/partial-close',
    MoveBreakEven: 'forex/trade/break-even',
    KillSwitch: 'forex/trade/kill-switch',
    ResetAccount: 'forex/trade/reset-account',
    Webhook: 'forex/trade/webhook',
  } as const;

  public static readonly Crypto = {
    MarketOverview: 'crypto/market',
    Chart: 'crypto/market/chart',
    OrderBook: 'crypto/market/orderbook',
    Futures: 'crypto/market/futures',
    OrderFlow: 'crypto/market/orderflow',
    OnChain: 'crypto/market/onchain',
    ExchangeFlow: 'crypto/market/exchangeflow',
    TokenUnlocks: 'crypto/market/tokenunlocks',
    DexScreener: 'crypto/market/dexscreener',
    Alerts: 'crypto/alerts',
    CreateAlert: 'crypto/alerts',
    DeleteAlert: 'crypto/alerts/{alertId:guid}',
    SendTestAlert: 'crypto/alerts/{alertId:guid}/test',
    Settings: 'crypto/settings',
    UpdateSettings: 'crypto/settings',
    TestConnection: 'crypto/settings/test-connection',
    TradeTerminal: 'crypto/trade',
    PlaceOrder: 'crypto/trade/order',
    ClosePosition: 'crypto/trade/position/close',
    CancelOrder: 'crypto/trade/order/cancel',
    UpdateStops: 'crypto/trade/stops',
    PlaceSmartOrder: 'crypto/trade/smart-order',
    Arbitrage: 'crypto/trade/arbitrage',
    ExecuteArbitrage: 'crypto/trade/arbitrage/execute',
    Strategies: 'crypto/strategies',
    BacktestSimulation: 'crypto/strategies/simulation',
    ExecuteBacktest: 'crypto/strategies/backtest',
    Portfolio: 'crypto/portfolio',
    Journal: 'crypto/portfolio/journal',
    SaveJournal: 'crypto/portfolio/journal',
    TaxReport: 'crypto/portfolio/tax',
    ExportTaxCsv: 'crypto/portfolio/tax/export',
    ResetAccount: 'crypto/portfolio/account/reset',
    RiskDashboard: 'crypto/risk',
    KillSwitch: 'crypto/risk/kill-switch',
    UpdateLimits: 'crypto/risk/limits',
    TopUpMargin: 'crypto/risk/margin/top-up',
    TrimPosition: 'crypto/risk/position/trim',
    CalculateAtr: 'crypto/risk/atr',
    AnalysisTechnical: 'crypto/analysis/technical',
    MarketStructure: 'crypto/analysis/market-structure',
    VolumeProfile: 'crypto/analysis/volume-profile',
    MarketRegime: 'crypto/analysis/market-regime',
    Sentiment: 'crypto/analysis/sentiment',
    Screener: 'crypto/analysis/screener',
    OnChainAnalysis: 'crypto/analysis/onchain',
  } as const;

  public static readonly Notification = {
    UserNotifications: 'notifications/user',
    MarkRead: 'notifications/mark-read',
    SubscribePush: 'notifications/subscribe-push',
    VapidPublicKey: 'notifications/vapid-public-key',
    SendTest: 'notifications/send-test',
    Delete: 'notifications/delete',
    DeleteByDateRange: 'notifications/delete-by-date-range',
  } as const;

  public static readonly Profile = {
    Get: 'profile',
    Update: 'profile',
  } as const;

  public static readonly UserPreference = {
    Get: 'user-preference',
    Update: 'user-preference',
  } as const;

  public static readonly OutboxAdmin = {
    Outbox: 'outbox-admin/outbox',
    Inbox: 'outbox-admin/inbox',
    Payload: 'outbox-admin/outbox/{id:guid}/payload',
    Retry: 'outbox-admin/outbox/{id:guid}/retry',
    Delete: 'outbox-admin/outbox/delete',
    DeleteByDateRange: 'outbox-admin/outbox/delete-by-date-range',
    DeleteInbox: 'outbox-admin/inbox/delete',
    DeleteInboxByDateRange: 'outbox-admin/inbox/delete-by-date-range',
  } as const;

  public static readonly AuditLog = {
    Logs: 'audit-log',
    Delete: 'audit-log/{id:guid}',
    DeleteByUser: 'audit-log/user/{userId:guid}',
    DeleteByDateRange: 'audit-log/delete-by-date-range',
    PurgeAll: 'audit-log/purge',
  } as const;

  /**
   * Initializes a fluent UrlBuilder with the running backend apiBaseUrl.
   */
  public static to(route: string): UrlBuilder {
    return UrlBuilder.create(environment.apiBaseUrl).path(route);
  }

  /**
   * One-line helper to concatenate base, route, route parameters, and query parameters.
   */
  public static build(
    route: string,
    params?: Record<string, string | number | boolean>,
    query?: Record<string, any>
  ): string {
    const builder = Url.to(route);
    if (params) {
      builder.params(params);
    }
    if (query) {
      builder.queryMap(query);
    }
    return builder.build();
  }
}
