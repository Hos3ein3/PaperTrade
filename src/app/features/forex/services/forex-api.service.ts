import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, throwError } from 'rxjs';
import { Url } from '../../../core/url-builder/url';
import { environment } from '../../../../environments/environment';
import {
  ForexMarketOverview,
  ForexTradeDashboard,
  CurrencyStrength,
  EconomicEvent,
  ForexRiskOverview,
  ForexJournalEntry,
  ForexTradeDirection,
  ForexTradeStatus,
} from '../models/forex.models';

@Injectable({
  providedIn: 'root',
})
export class ForexApiService {
  private readonly http = inject(HttpClient);

  public getMarketOverview(page: number = 1, pageSize: number = 50, category?: string, search?: string): Observable<ForexMarketOverview> {
    const url = Url.build(Url.Forex.MarketOverview, undefined, {
      Page: page,
      PageSize: pageSize,
      ...(category ? { Category: category } : {}),
      ...(search ? { Search: search } : {}),
    });
    return this.http.get<ForexMarketOverview>(url).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          return of(this.getMockMarketOverview());
        }
        return throwError(() => err);
      })
    );
  }

  public getTradeDashboard(page: number = 1, pageSize: number = 20, symbol?: string): Observable<ForexTradeDashboard> {
    const url = Url.build(Url.Forex.TradeDashboard, undefined, {
      Page: page,
      PageSize: pageSize,
      ...(symbol ? { Symbol: symbol } : {}),
    });
    return this.http.get<ForexTradeDashboard>(url).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          return of(this.getMockTradeDashboard());
        }
        return throwError(() => err);
      })
    );
  }

  public getCurrencyStrength(): Observable<CurrencyStrength[]> {
    const url = Url.build(Url.Forex.Strength);
    return this.http.get<CurrencyStrength[]>(url).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          const mockStrengths: CurrencyStrength[] = [
            { currency: 'USD', score: 8.4, bias: 'Strong' },
            { currency: 'GBP', score: 7.2, bias: 'Strong' },
            { currency: 'EUR', score: 5.8, bias: 'Neutral' },
            { currency: 'AUD', score: 5.1, bias: 'Neutral' },
            { currency: 'CAD', score: 4.8, bias: 'Neutral' },
            { currency: 'CHF', score: 3.9, bias: 'Weak' },
            { currency: 'NZD', score: 3.2, bias: 'Weak' },
            { currency: 'JPY', score: 2.1, bias: 'Weak' },
          ];
          return of(mockStrengths);
        }
        return throwError(() => err);
      })
    );
  }

  public getEconomicCalendar(): Observable<EconomicEvent[]> {
    const url = Url.build(Url.Forex.Fundamental);
    return this.http.get<EconomicEvent[]>(url).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          const mockEvents: EconomicEvent[] = [
            { timeUtc: '12:30', currency: 'USD', impact: 'High', eventName: 'Core CPI (MoM)', actual: '0.3%', forecast: '0.2%', previous: '0.3%' },
            { timeUtc: '13:00', currency: 'EUR', impact: 'Medium', eventName: 'ECB Monetary Policy Statement', actual: '3.25%', forecast: '3.25%', previous: '3.50%' },
            { timeUtc: '14:30', currency: 'USD', impact: 'High', eventName: 'Initial Jobless Claims', actual: '215K', forecast: '220K', previous: '224K' },
            { timeUtc: '23:30', currency: 'JPY', impact: 'High', eventName: 'Tokyo Core CPI (YoY)', actual: '2.1%', forecast: '2.0%', previous: '1.9%' },
          ];
          return of(mockEvents);
        }
        return throwError(() => err);
      })
    );
  }

  public getRiskOverview(): Observable<ForexRiskOverview> {
    const url = Url.build(Url.Forex.RiskOverview);
    return this.http.get<ForexRiskOverview>(url).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          return of({
            totalExposureLots: 1.50,
            maxDailyDrawdownLimit: 5.0,
            currentDrawdownPercent: 1.24,
            marginUtilizationPercent: 12.5,
            accountLeverage: 50,
            recommendedMaxLots: 3.20,
          });
        }
        return throwError(() => err);
      })
    );
  }

  public calculateLotSize(accountBalance: number, riskPercent: number, stopLossPips: number): Observable<{ lotSize: number; riskAmountUsd: number }> {
    const url = Url.build(Url.Forex.CalculateLotSize);
    return this.http.post<{ lotSize: number; riskAmountUsd: number }>(url, { accountBalance, riskPercent, stopLossPips }).pipe(
      catchError(() => {
        const riskAmount = (accountBalance * riskPercent) / 100;
        const lot = Number((riskAmount / (stopLossPips * 10)).toFixed(2));
        return of({ lotSize: Math.max(0.01, lot), riskAmountUsd: riskAmount });
      })
    );
  }

  public placeOrder(order: any): Observable<any> {
    const url = Url.build(Url.Forex.PlaceOrder);
    return this.http.post(url, order).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          return of({ success: true, message: 'Forex order executed.' });
        }
        return throwError(() => err);
      })
    );
  }

  public closeTrade(tradeId: string): Observable<any> {
    const url = Url.build(Url.Forex.CloseTrade);
    return this.http.post(url, { tradeId }).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          return of({ success: true, message: 'Trade closed.' });
        }
        return throwError(() => err);
      })
    );
  }

  public activateKillSwitch(reason: string = 'Emergency halt'): Observable<any> {
    const url = Url.build(Url.Forex.KillSwitch);
    return this.http.post(url, { reason }).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          return of({ success: true, message: 'All Forex positions closed.' });
        }
        return throwError(() => err);
      })
    );
  }

  public getJournal(): Observable<ForexJournalEntry[]> {
    const url = Url.build(Url.Forex.Journal);
    return this.http.get<ForexJournalEntry[]>(url).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          return of([
            { id: 'j-1', symbol: 'EUR/USD', tradeDirection: 'BUY', lotSize: 1.0, entryPrice: 1.0820, exitPrice: 1.0865, pnl: 450.0, pips: 45, strategyTag: 'London Breakout', psychologyNotes: 'Followed plan precisely, patient on entry pull-back.', createdAt: '2026-10-28' },
            { id: 'j-2', symbol: 'GBP/USD', tradeDirection: 'SELL', lotSize: 0.5, entryPrice: 1.3020, exitPrice: 1.2980, pnl: 200.0, pips: 40, strategyTag: 'Trend Continuation', psychologyNotes: 'Good risk to reward, trailing stop secured profit.', createdAt: '2026-10-27' },
          ]);
        }
        return throwError(() => err);
      })
    );
  }

  private getMockMarketOverview(): ForexMarketOverview {
    return {
      quotes: [
        { symbol: 'EUR/USD', displayName: 'Euro / US Dollar', bid: 1.0844, ask: 1.0846, spreadPips: 0.2, changePercent: 0.26, high24h: 1.0870, low24h: 1.0815, category: 'Majors' },
        { symbol: 'GBP/USD', displayName: 'British Pound / US Dollar', bid: 1.2979, ask: 1.2982, spreadPips: 0.3, changePercent: -0.35, high24h: 1.3040, low24h: 1.2960, category: 'Majors' },
        { symbol: 'USD/JPY', displayName: 'US Dollar / Japanese Yen', bid: 153.24, ask: 153.26, spreadPips: 0.2, changePercent: 0.56, high24h: 153.80, low24h: 152.10, category: 'Majors' },
        { symbol: 'USD/CHF', displayName: 'US Dollar / Swiss Franc', bid: 0.8652, ask: 0.8655, spreadPips: 0.3, changePercent: 0.18, high24h: 0.8680, low24h: 0.8630, category: 'Majors' },
        { symbol: 'AUD/USD', displayName: 'Australian / US Dollar', bid: 0.6580, ask: 0.6583, spreadPips: 0.3, changePercent: -0.42, high24h: 0.6620, low24h: 0.6565, category: 'Commodity' },
      ],
      sessions: [
        { session: 1, city: 'London', timeZone: 'GMT', openUtc: '08:00', closeUtc: '16:00', isOpen: true, activeOverlap: 'London-NY' },
        { session: 2, city: 'New York', timeZone: 'EST', openUtc: '13:00', closeUtc: '21:00', isOpen: true, activeOverlap: 'London-NY' },
        { session: 3, city: 'Tokyo', timeZone: 'JST', openUtc: '00:00', closeUtc: '08:00', isOpen: false, activeOverlap: 'None' },
        { session: 4, city: 'Sydney', timeZone: 'AEST', openUtc: '22:00', closeUtc: '06:00', isOpen: false, activeOverlap: 'None' },
      ],
      metalsAndIndices: [
        { symbol: 'XAU/USD', displayName: 'Gold / US Dollar', bid: 2748.20, ask: 2748.50, spreadPips: 3.0, changePercent: 0.82, high24h: 2755.0, low24h: 2730.0, category: 'Metals' },
        { symbol: 'XAG/USD', displayName: 'Silver / US Dollar', bid: 33.85, ask: 33.89, spreadPips: 0.4, changePercent: 1.45, high24h: 34.20, low24h: 33.10, category: 'Metals' },
      ],
    };
  }

  private getMockTradeDashboard(): ForexTradeDashboard {
    const market = this.getMockMarketOverview();
    return {
      account: {
        id: 'fx-acc-001',
        name: 'Forex Pro Practice',
        baseCurrency: 'USD',
        balance: 50000.0,
        equity: 50840.0,
        usedMargin: 1200.0,
        freeMargin: 49640.0,
        marginLevelPercent: 4236.6,
        leverage: 50,
        dailyPnl: 840.0,
        dailyDrawdownPercent: 0.85,
      },
      openTrades: [
        {
          id: 'fx-trade-1',
          accountId: 'fx-acc-001',
          symbol: 'EUR/USD',
          direction: ForexTradeDirection.Buy,
          lotSize: 1.0,
          openPrice: 1.0820,
          currentPrice: 1.0845,
          stopLoss: 1.0790,
          takeProfit: 1.0910,
          unrealizedPnl: 250.0,
          unrealizedPips: 25.0,
          openTimeUtc: new Date(Date.now() - 3600000 * 2).toISOString(),
          status: ForexTradeStatus.Open,
        },
      ],
      pendingOrders: [],
      recentClosedTrades: [],
      liveWatchlist: market.quotes,
    };
  }
}
