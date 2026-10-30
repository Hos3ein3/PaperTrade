export enum AssetClass {
  Crypto = 1,
  Forex = 2,
  Stock = 3,
  Index = 4,
  Future = 5,
}

export enum TradingOrderSide {
  Buy = 1,
  Sell = 2,
}

export enum TradingOrderType {
  Market = 1,
  Limit = 2,
  Stop = 3,
}

export enum TradingOrderStatus {
  Pending = 1,
  Filled = 2,
  Cancelled = 3,
  Expired = 4,
}

export enum TradingPositionStatus {
  Open = 1,
  Closed = 2,
  Liquidated = 3,
}

export enum TimeInForce {
  Day = 1,
  Week = 2,
  Month = 3,
  GTD = 4,
  GTC = 5,
}

export interface TradingAccount {
  id: string;
  userId: string;
  tenantId: string;
  name: string;
  currency: string;
  cashBalance: number;
  equity: number;
  marginUsed: number;
  freeMargin: number;
  realizedPnl: number;
}

export interface TradingQuote {
  symbol: string;
  assetName: string;
  assetClass: AssetClass;
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  isWatchlisted: boolean;
  isSimulated?: boolean;
  feedSource?: string;
  maxLeverage?: number;
}

export interface TradingBracketTier {
  bracket: number;
  initialLeverage: number;
  notionalCap: number;
  notionalFloor: number;
  maintMarginRatio: number;
  cum: number;
}

export interface TradingLeverageBracket {
  symbol: string;
  maxLeverage: number;
  minLeverage: number;
  brackets: TradingBracketTier[];
}

export interface TradingPosition {
  id: string;
  accountId: string;
  symbol: string;
  assetName: string;
  assetClass: AssetClass;
  side: TradingOrderSide;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  closePrice?: number;
  leverage: number;
  initialMargin: number;
  unrealizedPnl: number;
  realizedPnl: number;
  stopLoss?: number;
  takeProfit?: number;
  multipleTakeProfitsJson?: string;
  trailingStopDistance?: number;
  status: TradingPositionStatus;
  openedAtUtc: string;
  closedAtUtc?: string;
}

export interface TradingOrder {
  id: string;
  accountId: string;
  symbol: string;
  assetName: string;
  assetClass: AssetClass;
  side: TradingOrderSide;
  orderType: TradingOrderType;
  quantity: number;
  price?: number;
  triggerPrice?: number;
  leverage: number;
  stopLoss?: number;
  takeProfit?: number;
  multipleTakeProfitsJson?: string;
  timeInForce: TimeInForce;
  status: TradingOrderStatus;
  placedAtUtc: string;
  filledAtUtc?: string;
  cancelledAtUtc?: string;
}

export interface TradingWatchlistItem {
  id: string;
  symbol: string;
  assetName: string;
  assetClass: AssetClass;
  displayOrder: number;
}

export interface TradingDashboard {
  account: TradingAccount;
  openPositions: TradingPosition[];
  closedPositions: TradingPosition[];
  pendingOrders: TradingOrder[];
  watchlist: TradingWatchlistItem[];
  quotes: TradingQuote[];
  selectedQuote: TradingQuote;
}

export interface PlaceOrderRequest {
  symbol: string;
  assetName: string;
  assetClass: AssetClass;
  side: TradingOrderSide;
  orderType: TradingOrderType;
  quantity: number;
  price?: number;
  triggerPrice?: number;
  leverage: number;
  stopLoss?: number;
  takeProfit?: number;
  multipleTakeProfitsJson?: string;
  trailingStopDistance?: number;
  timeInForce?: TimeInForce;
  expiryDateUtc?: string;
}

export interface ClosePositionRequest {
  positionId: string;
  closePrice?: number;
  symbol?: string;
  sourcePage?: string;
}

export interface ModifyPositionRequest {
  positionId: string;
  stopLoss?: number;
  takeProfit?: number;
  trailingStopDistance?: number;
  multipleTakeProfitsJson?: string;
  symbol?: string;
  sourcePage?: string;
}

export interface CancelOrderRequest {
  orderId: string;
  symbol?: string;
  sourcePage?: string;
}

export interface ResetBalanceRequest {
  newBalance: number;
  symbol?: string;
}

export interface TradingHistoryItem {
  id: string;
  accountId: string;
  symbol: string;
  assetName: string;
  assetClass: AssetClass;
  side: TradingOrderSide;
  quantity: number;
  entryPrice: number;
  closePrice?: number;
  currentPrice: number;
  leverage: number;
  initialMargin: number;
  wholeAccountBalance: number;
  balancePercentage: number;
  notionalValue: number;
  stopLoss?: number;
  takeProfit?: number;
  multipleTakeProfitsJson?: string;
  trailingStopDistance?: number;
  realizedPnl: number;
  roiPercentage: number;
  status: TradingPositionStatus;
  outcomeBadge: string;
  closeReasonBadge: string;
  openedAtUtc: string;
  closedAtUtc?: string;
  duration?: string;
}

export interface TradingHistorySummary {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakEvenTrades: number;
  winRatePercentage: number;
  totalRealizedProfit: number;
  totalRealizedLoss: number;
  netRealizedPnl: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  payoffRatio: number;
  largestWin: number;
  largestLoss: number;
  totalVolumeNotional: number;
}

export interface TradingHistoryResponse {
  account: TradingAccount;
  summary: TradingHistorySummary;
  trades: TradingHistoryItem[];
  searchFilter?: string;
  sideFilter?: TradingOrderSide;
  assetClassFilter?: AssetClass;
  outcomeFilter?: string;
}
