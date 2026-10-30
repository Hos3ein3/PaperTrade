import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, throwError } from 'rxjs';
import { Url } from '../../../core/url-builder/url';
import { environment } from '../../../../environments/environment';
import {
  CryptoMarketOverview,
  CryptoFuturesFunding,
  ArbitrageOpportunity,
  CryptoAlert,
  CryptoPortfolioHolding,
} from '../models/crypto.models';

@Injectable({
  providedIn: 'root',
})
export class CryptoApiService {
  private readonly http = inject(HttpClient);

  public getMarketOverview(filter?: {
    sortBy?: string;
    sortDirection?: string;
    page?: number;
    pageSize?: number;
    category?: string;
    search?: string;
  }): Observable<CryptoMarketOverview> {
    const url = Url.build(Url.Crypto.MarketOverview, undefined, {
      SortBy: filter?.sortBy ?? 'Rank',
      SortDirection: filter?.sortDirection ?? 'Asc',
      Page: filter?.page ?? 1,
      PageSize: filter?.pageSize ?? 20,
      Category: filter?.category ?? 'All',
      ...(filter?.search ? { Search: filter.search } : {}),
    });
    return this.http.get<CryptoMarketOverview>(url).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          return of(this.getMockMarketOverview());
        }
        return throwError(() => err);
      })
    );
  }

  public getFutures(symbol: string = 'BTCUSDT'): Observable<CryptoFuturesFunding[]> {
    const url = Url.build(Url.Crypto.Futures, undefined, { Symbol: symbol });
    return this.http.get<CryptoFuturesFunding[]>(url).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          return of([
            { symbol: 'BTCUSDT-PERP', markPrice: 67455.2, indexPrice: 67450.0, fundingRate: 0.0001, estimatedAnnualRate: 10.95, nextFundingTimeUtc: '08:00 UTC', openInterestUsd: 14200000000 },
            { symbol: 'ETHUSDT-PERP', markPrice: 3522.0, indexPrice: 3520.1, fundingRate: 0.00015, estimatedAnnualRate: 16.42, nextFundingTimeUtc: '08:00 UTC', openInterestUsd: 7800000000 },
            { symbol: 'SOLUSDT-PERP', markPrice: 178.9, indexPrice: 178.6, fundingRate: 0.0002, estimatedAnnualRate: 21.90, nextFundingTimeUtc: '08:00 UTC', openInterestUsd: 2100000000 },
          ]);
        }
        return throwError(() => err);
      })
    );
  }

  public getArbitrage(): Observable<ArbitrageOpportunity[]> {
    const url = Url.build(Url.Crypto.Arbitrage);
    return this.http.get<ArbitrageOpportunity[]>(url).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          return of([
            { type: 'Cross-Exchange Spot', pairOrRoute: 'BTC/USDT', sourceExchange: 'Kraken', targetExchange: 'Binance', sourcePrice: 67410.0, targetPrice: 67485.0, spreadPercent: 0.11, estimatedProfitUsd: 150.0 },
            { type: 'Cross-Exchange Spot', pairOrRoute: 'SOL/USDT', sourceExchange: 'Coinbase', targetExchange: 'Bybit', sourcePrice: 178.10, targetPrice: 178.75, spreadPercent: 0.36, estimatedProfitUsd: 65.0 },
          ]);
        }
        return throwError(() => err);
      })
    );
  }

  public getAlerts(): Observable<CryptoAlert[]> {
    const url = Url.build(Url.Crypto.Alerts);
    return this.http.get<CryptoAlert[]>(url).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          return of([
            { id: 'al-1', symbol: 'BTCUSDT', alertType: 1, targetValue: 70000, message: 'BTC breakout target hit', isTriggered: false, createdAt: '2026-10-29' },
            { id: 'al-2', symbol: 'ETHUSDT', alertType: 2, targetValue: 3400, message: 'ETH dip alert', isTriggered: false, createdAt: '2026-10-29' },
          ]);
        }
        return throwError(() => err);
      })
    );
  }

  public createAlert(alert: Partial<CryptoAlert>): Observable<any> {
    const url = Url.build(Url.Crypto.CreateAlert);
    return this.http.post(url, alert).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          return of({ success: true, message: 'Alert created.' });
        }
        return throwError(() => err);
      })
    );
  }

  public deleteAlert(alertId: string): Observable<any> {
    const url = Url.build(Url.Crypto.DeleteAlert, { alertId });
    return this.http.delete(url).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          return of({ success: true });
        }
        return throwError(() => err);
      })
    );
  }

  public getPortfolio(): Observable<CryptoPortfolioHolding[]> {
    const url = Url.build(Url.Crypto.Portfolio);
    return this.http.get<CryptoPortfolioHolding[]>(url).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          return of([
            { symbol: 'BTC', name: 'Bitcoin', quantity: 0.65, averageBuyPrice: 62400.0, currentPrice: 67450.5, totalValueUsd: 43842.82, unrealizedPnl: 3282.82, allocationPercent: 55.0 },
            { symbol: 'ETH', name: 'Ethereum', quantity: 5.5, averageBuyPrice: 3400.0, currentPrice: 3520.1, totalValueUsd: 19360.55, unrealizedPnl: 660.55, allocationPercent: 25.0 },
            { symbol: 'SOL', name: 'Solana', quantity: 70, averageBuyPrice: 155.0, currentPrice: 178.6, totalValueUsd: 12502.0, unrealizedPnl: 1652.0, allocationPercent: 15.0 },
            { symbol: 'USDT', name: 'Tether USD', quantity: 4000, averageBuyPrice: 1.0, currentPrice: 1.0, totalValueUsd: 4000.0, unrealizedPnl: 0, allocationPercent: 5.0 },
          ]);
        }
        return throwError(() => err);
      })
    );
  }

  public activateKillSwitch(reason: string = 'Emergency Stop'): Observable<any> {
    const url = Url.build(Url.Crypto.KillSwitch);
    return this.http.post(url, { reason }).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          return of({ success: true, message: 'Crypto kill switch executed.' });
        }
        return throwError(() => err);
      })
    );
  }

  private getMockMarketOverview(): CryptoMarketOverview {
    return {
      totalMarketCapUsd: 2450000000000,
      marketCapChange24h: 3.15,
      totalVolume24h: 78000000000,
      btcDominance: 56.4,
      ethDominance: 16.8,
      fearAndGreedIndex: 72,
      fearAndGreedSentiment: 'Greed',
      coins: [
        { rank: 1, symbol: 'BTC', name: 'Bitcoin', price: 67450.5, change1h: 0.2, change24h: 2.82, change7d: 5.4, marketCap: 1320000000000, volume24h: 34000000000, high24h: 68100, low24h: 65200, circulatingSupply: 19780000 },
        { rank: 2, symbol: 'ETH', name: 'Ethereum', price: 3520.1, change1h: -0.1, change24h: -1.2, change7d: 4.1, marketCap: 420000000000, volume24h: 18000000000, high24h: 3610, low24h: 3480, circulatingSupply: 120400000 },
        { rank: 3, symbol: 'SOL', name: 'Solana', price: 178.6, change1h: 0.8, change24h: 4.93, change7d: 12.8, marketCap: 83000000000, volume24h: 4500000000, high24h: 182, low24h: 169.5, circulatingSupply: 470000000 },
        { rank: 4, symbol: 'BNB', name: 'BNB', price: 595.4, change1h: 0.1, change24h: 1.15, change7d: 2.3, marketCap: 87000000000, volume24h: 1200000000, high24h: 602, low24h: 588, circulatingSupply: 145000000 },
      ],
    };
  }
}
