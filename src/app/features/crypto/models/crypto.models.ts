export interface CryptoCoin {
  rank: number;
  symbol: string;
  name: string;
  price: number;
  change1h: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  circulatingSupply: number;
}

export interface CryptoMarketOverview {
  totalMarketCapUsd: number;
  marketCapChange24h: number;
  totalVolume24h: number;
  btcDominance: number;
  ethDominance: number;
  fearAndGreedIndex: number;
  fearAndGreedSentiment: string;
  coins: CryptoCoin[];
}

export interface CryptoFuturesFunding {
  symbol: string;
  markPrice: number;
  indexPrice: number;
  fundingRate: number;
  estimatedAnnualRate: number;
  nextFundingTimeUtc: string;
  openInterestUsd: number;
}

export interface ArbitrageOpportunity {
  type: string;
  pairOrRoute: string;
  sourceExchange: string;
  targetExchange: string;
  sourcePrice: number;
  targetPrice: number;
  spreadPercent: number;
  estimatedProfitUsd: number;
}

export interface CryptoAlert {
  id: string;
  symbol: string;
  alertType: number;
  targetValue: number;
  message?: string;
  channel?: string;
  isTriggered: boolean;
  createdAt: string;
}

export interface CryptoPortfolioHolding {
  symbol: string;
  name: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  totalValueUsd: number;
  unrealizedPnl: number;
  allocationPercent: number;
}
