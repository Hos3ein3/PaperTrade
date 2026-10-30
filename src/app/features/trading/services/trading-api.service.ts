import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { Url } from '../../../core/url-builder/url';
import { environment } from '../../../../environments/environment';
import {
  AssetClass,
  TradingDashboard,
  TradingQuote,
  TradingOrderSide,
  TradingOrderType,
  TradingPositionStatus,
  TradingOrderStatus,
  PlaceOrderRequest,
  ClosePositionRequest,
  ModifyPositionRequest,
  CancelOrderRequest,
  ResetBalanceRequest,
  TradingHistoryResponse,
  TradingLeverageBracket,
} from '../models/trading.models';

@Injectable({
  providedIn: 'root',
})
export class TradingApiService {
  private readonly http = inject(HttpClient);

  public getDashboard(symbol: string = 'BTCUSDT'): Observable<TradingDashboard> {
    const url = Url.build(Url.Trading.Dashboard, undefined, { symbol });

    return this.http.get<TradingDashboard>(url).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          return of(this.getMockDashboard(symbol));
        }
        return throwError(() => err);
      })
    );
  }

  public getLiveStatus(symbol?: string): Observable<any> {
    const url = Url.build(Url.Trading.LiveStatus, undefined, symbol ? { symbol } : undefined);
    return this.http.get<any>(url);
  }

  public getQuotes(assetClass?: AssetClass, search?: string): Observable<TradingQuote[]> {
    const url = Url.build(Url.Trading.Quotes, undefined, { assetClass, search });

    return this.http.get<TradingQuote[]>(url).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          return of(this.getMockQuotes());
        }
        return throwError(() => err);
      })
    );
  }

  public getQuote(symbol: string): Observable<TradingQuote> {
    const url = Url.build(Url.Trading.Quote, undefined, { symbol });

    return this.http.get<TradingQuote>(url).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          const quotes = this.getMockQuotes();
          const match = quotes.find((q) => q.symbol.toUpperCase() === symbol.toUpperCase()) || quotes[0];
          return of(match);
        }
        return throwError(() => err);
      })
    );
  }

  public getLeverageBracket(symbol: string): Observable<TradingLeverageBracket> {
    const url = Url.build(Url.Trading.LeverageBracket, undefined, { symbol });
    return this.http.get<any>(url).pipe(
      map((res: any) => {
        const val = res?.value ?? res?.data ?? res;
        return {
          symbol: val?.symbol ?? symbol,
          maxLeverage: Number(val?.maxLeverage ?? 250),
          minLeverage: Number(val?.minLeverage ?? 1),
          brackets: val?.brackets ?? [],
        } as TradingLeverageBracket;
      }),
      catchError(() => {
        const s = (symbol || '').toUpperCase();
        const max = s === 'BTCUSDT' ? 125 : (s === 'ETHUSDT' ? 100 : (['SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'DOGEUSDT', 'ADAUSDT', 'LINKUSDT'].includes(s) ? 75 : 250));
        return of({
          symbol,
          maxLeverage: max,
          minLeverage: 1,
          brackets: [],
        } as TradingLeverageBracket);
      })
    );
  }

  public searchAssets(query: string): Observable<TradingQuote[]> {
    if (!query || !query.trim()) {
      return of([]);
    }
    const url = Url.build(Url.Trading.Search, undefined, { query: query.trim() });
    return this.http.get<any>(url).pipe(
      map((res: any) => {
        const raw = Array.isArray(res) ? res : (res?.value ?? res?.quotes ?? res?.data ?? []);
        return raw.map((item: any) => ({
          symbol: item.symbol ?? item.Symbol ?? '',
          assetName: item.assetName ?? item.Name ?? item.name ?? item.symbol,
          assetClass: item.assetClass ?? item.AssetClass ?? AssetClass.Crypto,
          price: Number(item.price ?? item.Price ?? 0),
          change24h: Number(item.change24h ?? item.Change24h ?? item.priceChange ?? 0),
          changePercent24h: Number(item.changePercent24h ?? item.ChangePercent24h ?? item.priceChangePercent ?? 0),
          high24h: Number(item.high24h ?? item.High24h ?? 0),
          low24h: Number(item.low24h ?? item.Low24h ?? 0),
          volume24h: Number(item.volume24h ?? item.Volume24h ?? 0),
          isWatchlisted: Boolean(item.isWatchlisted ?? item.IsWatchlisted),
          isSimulated: Boolean(item.isSimulated ?? item.IsSimulated),
          maxLeverage: item.maxLeverage ? Number(item.maxLeverage) : (item.MaxLeverage ? Number(item.MaxLeverage) : undefined),
        }));
      }),
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          const q = query.trim().toUpperCase();
          const quotes = this.getMockQuotes();
          const matched = quotes.filter((x) => x.symbol.includes(q) || x.assetName.toUpperCase().includes(q));
          if (matched.length > 0) return of(matched);
          return of([
            {
              symbol: q.endsWith('USDT') ? q : `${q}USDT`,
              assetName: `${q} Commodity / Asset`,
              assetClass: AssetClass.Future,
              price: 74.25,
              change24h: -0.85,
              changePercent24h: -1.13,
              high24h: 75.8,
              low24h: 73.6,
              volume24h: 85000000,
              isWatchlisted: false,
              isSimulated: true,
            },
          ]);
        }
        return throwError(() => err);
      })
    );
  }

  public getHistory(filters?: {
    search?: string;
    side?: TradingOrderSide;
    assetClass?: AssetClass;
    outcome?: string;
  }): Observable<TradingHistoryResponse> {
    const url = Url.build(Url.Trading.History, undefined, filters);

    return this.http.get<TradingHistoryResponse>(url).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          return of(this.getMockHistory());
        }
        return throwError(() => err);
      })
    );
  }

  public placeOrder(payload: PlaceOrderRequest): Observable<any> {
    const url = Url.build(Url.Trading.PlaceOrder);
    return this.http.post(url, payload).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          return of({ success: true, message: 'Order submitted successfully.' });
        }
        return throwError(() => err);
      })
    );
  }

  public closePosition(payload: ClosePositionRequest): Observable<any> {
    const url = Url.build(Url.Trading.ClosePosition);
    return this.http.post(url, payload).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          return of({ success: true, message: 'Position closed at market price.' });
        }
        return throwError(() => err);
      })
    );
  }

  public modifyPosition(payload: ModifyPositionRequest): Observable<any> {
    const url = Url.build(Url.Trading.ModifyPosition);
    return this.http.post(url, payload).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          return of({ success: true, message: 'Position SL/TP modified.' });
        }
        return throwError(() => err);
      })
    );
  }

  public cancelOrder(payload: CancelOrderRequest): Observable<any> {
    const url = Url.build(Url.Trading.CancelOrder);
    return this.http.post(url, payload).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          return of({ success: true, message: 'Pending order cancelled.' });
        }
        return throwError(() => err);
      })
    );
  }

  public resetBalance(payload: ResetBalanceRequest): Observable<any> {
    const url = Url.build(Url.Trading.ResetBalance);
    return this.http.post(url, payload).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          return of({ success: true, message: `Account balance reset to $${payload.newBalance.toLocaleString()}.` });
        }
        return throwError(() => err);
      })
    );
  }

  public toggleWatchlist(symbol: string, assetName: string, assetClass: AssetClass): Observable<any> {
    const url = Url.build(Url.Trading.WatchlistToggle);
    return this.http.post(url, { symbol, assetName, assetClass }).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          return of({ success: true, symbol });
        }
        return throwError(() => err);
      })
    );
  }

  public executeJson(json: string): Observable<any> {
    const url = Url.build(Url.Trading.ExecuteJson);
    return this.http.post(url, { json }).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          return of({ success: true, results: ['Executed mock batch sequence'] });
        }
        return throwError(() => err);
      })
    );
  }

  // --- Mock Seed Data for Robust Offline Simulation ---
  private getMockQuotes(): TradingQuote[] {
    return [
      { symbol: 'BTCUSDT', assetName: 'Bitcoin', assetClass: AssetClass.Crypto, price: 67450.50, change24h: 1850.20, changePercent24h: 2.82, high24h: 68100.0, low24h: 65200.0, volume24h: 3412000000, isWatchlisted: true },
      { symbol: 'ETHUSDT', assetName: 'Ethereum', assetClass: AssetClass.Crypto, price: 3520.10, change24h: -42.80, changePercent24h: -1.20, high24h: 3610.0, low24h: 3480.0, volume24h: 1845000000, isWatchlisted: true },
      { symbol: 'SOLUSDT', assetName: 'Solana', assetClass: AssetClass.Crypto, price: 178.60, change24h: 8.40, changePercent24h: 4.93, high24h: 182.0, low24h: 169.5, volume24h: 890000000, isWatchlisted: true },
      { symbol: 'EUR/USD', assetName: 'Euro / US Dollar', assetClass: AssetClass.Forex, price: 1.0845, change24h: 0.0028, changePercent24h: 0.26, high24h: 1.0870, low24h: 1.0815, volume24h: 5200000000, isWatchlisted: true },
      { symbol: 'GBP/USD', assetName: 'British Pound / US Dollar', assetClass: AssetClass.Forex, price: 1.2980, change24h: -0.0045, changePercent24h: -0.35, high24h: 1.3040, low24h: 1.2960, volume24h: 3100000000, isWatchlisted: false },
      { symbol: 'USD/JPY', assetName: 'US Dollar / Japanese Yen', assetClass: AssetClass.Forex, price: 153.25, change24h: 0.85, changePercent24h: 0.56, high24h: 153.80, low24h: 152.10, volume24h: 4800000000, isWatchlisted: false },
      { symbol: 'AAPL', assetName: 'Apple Inc.', assetClass: AssetClass.Stock, price: 232.40, change24h: 3.10, changePercent24h: 1.35, high24h: 233.8, low24h: 229.5, volume24h: 1250000000, isWatchlisted: true },
      { symbol: 'NVDA', assetName: 'NVIDIA Corp.', assetClass: AssetClass.Stock, price: 138.80, change24h: 5.60, changePercent24h: 4.20, high24h: 140.2, low24h: 132.5, volume24h: 4100000000, isWatchlisted: true },
      { symbol: 'SPX', assetName: 'S&P 500 Index', assetClass: AssetClass.Index, price: 5860.20, change24h: 32.50, changePercent24h: 0.56, high24h: 5875.0, low24h: 5820.0, volume24h: 9800000000, isWatchlisted: true },
    ];
  }

  private getMockDashboard(symbol: string): TradingDashboard {
    const quotes = this.getMockQuotes();
    const sel = quotes.find((q) => q.symbol.toUpperCase() === symbol.toUpperCase()) || quotes[0];

    return {
      account: {
        id: 'acc-paper-001',
        userId: 'usr-current',
        tenantId: 'ten-default',
        name: 'Virtual Pro Trading Account',
        currency: 'USD',
        cashBalance: 46250.00,
        equity: 51840.50,
        marginUsed: 4200.00,
        freeMargin: 47640.50,
        realizedPnl: 1840.50,
      },
      openPositions: [
        {
          id: 'pos-101',
          accountId: 'acc-paper-001',
          symbol: 'BTCUSDT',
          assetName: 'Bitcoin',
          assetClass: AssetClass.Crypto,
          side: TradingOrderSide.Buy,
          quantity: 0.5,
          entryPrice: 65200.00,
          currentPrice: 67450.50,
          leverage: 10,
          initialMargin: 3260.00,
          unrealizedPnl: 1125.25,
          realizedPnl: 0,
          stopLoss: 64000.00,
          takeProfit: 71000.00,
          status: TradingPositionStatus.Open,
          openedAtUtc: new Date(Date.now() - 4 * 3600000).toISOString(),
        },
        {
          id: 'pos-102',
          accountId: 'acc-paper-001',
          symbol: 'EUR/USD',
          assetName: 'Euro / US Dollar',
          assetClass: AssetClass.Forex,
          side: TradingOrderSide.Buy,
          quantity: 100000,
          entryPrice: 1.0820,
          currentPrice: 1.0845,
          leverage: 50,
          initialMargin: 940.00,
          unrealizedPnl: 250.00,
          realizedPnl: 0,
          stopLoss: 1.0790,
          takeProfit: 1.0910,
          status: TradingPositionStatus.Open,
          openedAtUtc: new Date(Date.now() - 8 * 3600000).toISOString(),
        },
      ],
      closedPositions: [],
      pendingOrders: [
        {
          id: 'ord-201',
          accountId: 'acc-paper-001',
          symbol: 'ETHUSDT',
          assetName: 'Ethereum',
          assetClass: AssetClass.Crypto,
          side: TradingOrderSide.Buy,
          orderType: TradingOrderType.Limit,
          quantity: 2.0,
          price: 3450.00,
          leverage: 5,
          stopLoss: 3320.00,
          takeProfit: 3750.00,
          timeInForce: 5, // GTC
          status: TradingOrderStatus.Pending,
          placedAtUtc: new Date(Date.now() - 12 * 3600000).toISOString(),
        },
      ],
      watchlist: [
        { id: 'w-1', symbol: 'BTCUSDT', assetName: 'Bitcoin', assetClass: AssetClass.Crypto, displayOrder: 1 },
        { id: 'w-2', symbol: 'ETHUSDT', assetName: 'Ethereum', assetClass: AssetClass.Crypto, displayOrder: 2 },
        { id: 'w-3', symbol: 'EUR/USD', assetName: 'Euro / US Dollar', assetClass: AssetClass.Forex, displayOrder: 3 },
        { id: 'w-4', symbol: 'NVDA', assetName: 'NVIDIA Corp.', assetClass: AssetClass.Stock, displayOrder: 4 },
      ],
      quotes,
      selectedQuote: sel,
    };
  }

  private getMockHistory(): TradingHistoryResponse {
    const summary = {
      totalTrades: 32,
      winningTrades: 22,
      losingTrades: 9,
      breakEvenTrades: 1,
      winRatePercentage: 68.75,
      totalRealizedProfit: 8450.00,
      totalRealizedLoss: -2890.00,
      netRealizedPnl: 5560.00,
      profitFactor: 2.92,
      averageWin: 384.09,
      averageLoss: -321.11,
      payoffRatio: 1.20,
      largestWin: 1450.00,
      largestLoss: -680.00,
      totalVolumeNotional: 425000.00,
    };

    const trades = [
      {
        id: 'hist-1',
        accountId: 'acc-paper-001',
        symbol: 'BTCUSDT',
        assetName: 'Bitcoin',
        assetClass: AssetClass.Crypto,
        side: TradingOrderSide.Buy,
        quantity: 0.4,
        entryPrice: 63200.00,
        closePrice: 65100.00,
        currentPrice: 67450.50,
        leverage: 10,
        initialMargin: 2528.00,
        wholeAccountBalance: 50000.00,
        balancePercentage: 5.06,
        notionalValue: 25280.00,
        stopLoss: 62000.00,
        takeProfit: 65000.00,
        realizedPnl: 760.00,
        roiPercentage: 30.06,
        status: TradingPositionStatus.Closed,
        outcomeBadge: 'WIN',
        closeReasonBadge: 'TP HIT',
        openedAtUtc: new Date(Date.now() - 48 * 3600000).toISOString(),
        closedAtUtc: new Date(Date.now() - 36 * 3600000).toISOString(),
        duration: '12h 00m',
      },
      {
        id: 'hist-2',
        accountId: 'acc-paper-001',
        symbol: 'SOLUSDT',
        assetName: 'Solana',
        assetClass: AssetClass.Crypto,
        side: TradingOrderSide.Buy,
        quantity: 25,
        entryPrice: 162.50,
        closePrice: 174.20,
        currentPrice: 178.60,
        leverage: 5,
        initialMargin: 812.50,
        wholeAccountBalance: 50000.00,
        balancePercentage: 1.63,
        notionalValue: 4062.50,
        realizedPnl: 292.50,
        roiPercentage: 36.00,
        status: TradingPositionStatus.Closed,
        outcomeBadge: 'WIN',
        closeReasonBadge: 'MANUAL EXIT',
        openedAtUtc: new Date(Date.now() - 72 * 3600000).toISOString(),
        closedAtUtc: new Date(Date.now() - 50 * 3600000).toISOString(),
        duration: '22h 00m',
      },
      {
        id: 'hist-3',
        accountId: 'acc-paper-001',
        symbol: 'EUR/USD',
        assetName: 'Euro / US Dollar',
        assetClass: AssetClass.Forex,
        side: TradingOrderSide.Sell,
        quantity: 50000,
        entryPrice: 1.0880,
        closePrice: 1.0915,
        currentPrice: 1.0845,
        leverage: 50,
        initialMargin: 544.00,
        wholeAccountBalance: 50000.00,
        balancePercentage: 1.09,
        notionalValue: 54400.00,
        stopLoss: 1.0915,
        realizedPnl: -175.00,
        roiPercentage: -32.17,
        status: TradingPositionStatus.Closed,
        outcomeBadge: 'LOSS',
        closeReasonBadge: 'SL HIT',
        openedAtUtc: new Date(Date.now() - 96 * 3600000).toISOString(),
        closedAtUtc: new Date(Date.now() - 90 * 3600000).toISOString(),
        duration: '6h 00m',
      },
    ];

    return {
      account: {
        id: 'acc-paper-001',
        userId: 'usr-current',
        tenantId: 'ten-default',
        name: 'Virtual Pro Trading Account',
        currency: 'USD',
        cashBalance: 46250.00,
        equity: 51840.50,
        marginUsed: 4200.00,
        freeMargin: 47640.50,
        realizedPnl: 1840.50,
      },
      summary,
      trades,
    };
  }
}
