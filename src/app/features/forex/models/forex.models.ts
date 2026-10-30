export enum ForexTradeDirection {
  Buy = 1,
  Sell = 2,
}

export enum ForexOrderType {
  Market = 1,
  Limit = 2,
  Stop = 3,
}

export enum ForexTradeStatus {
  Open = 1,
  Closed = 2,
}

export interface ForexQuote {
  symbol: string;
  displayName: string;
  bid: number;
  ask: number;
  spreadPips: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  category: string;
}

export interface ForexSession {
  session: number;
  city: string;
  timeZone: string;
  openUtc: string;
  closeUtc: string;
  isOpen: boolean;
  activeOverlap: string;
}

export interface ForexMarketOverview {
  quotes: ForexQuote[];
  sessions: ForexSession[];
  metalsAndIndices: ForexQuote[];
}

export interface ForexAccount {
  id: string;
  name: string;
  baseCurrency: string;
  balance: number;
  equity: number;
  usedMargin: number;
  freeMargin: number;
  marginLevelPercent: number;
  leverage: number;
  dailyPnl: number;
  dailyDrawdownPercent: number;
}

export interface ForexTrade {
  id: string;
  accountId: string;
  symbol: string;
  direction: ForexTradeDirection;
  lotSize: number;
  openPrice: number;
  closePrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  currentPrice: number;
  unrealizedPnl: number;
  unrealizedPips: number;
  openTimeUtc: string;
  status: ForexTradeStatus;
}

export interface ForexTradeDashboard {
  account: ForexAccount;
  openTrades: ForexTrade[];
  pendingOrders: any[];
  recentClosedTrades: ForexTrade[];
  liveWatchlist: ForexQuote[];
}

export interface CurrencyStrength {
  currency: string;
  score: number; // 0 to 10
  bias: 'Strong' | 'Neutral' | 'Weak';
}

export interface EconomicEvent {
  timeUtc: string;
  currency: string;
  impact: 'High' | 'Medium' | 'Low';
  eventName: string;
  actual?: string;
  forecast?: string;
  previous?: string;
}

export interface ForexRiskOverview {
  totalExposureLots: number;
  maxDailyDrawdownLimit: number;
  currentDrawdownPercent: number;
  marginUtilizationPercent: number;
  accountLeverage: number;
  recommendedMaxLots: number;
}

export interface ForexJournalEntry {
  id: string;
  symbol: string;
  tradeDirection: string;
  lotSize: number;
  entryPrice: number;
  exitPrice?: number;
  pnl: number;
  pips: number;
  strategyTag: string;
  psychologyNotes: string;
  createdAt: string;
}
