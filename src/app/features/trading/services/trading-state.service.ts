import { Injectable, inject, signal, computed, OnDestroy } from '@angular/core';
import { TradingApiService } from './trading-api.service';
import { ToastService } from '../../../core/notifications/toast.service';
import {
  AssetClass,
  TradingDashboard,
  TradingQuote,
  PlaceOrderRequest,
  ClosePositionRequest,
  ModifyPositionRequest,
  CancelOrderRequest,
  TradingOrderSide,
  TradingPositionStatus,
  TradingPosition,
} from '../models/trading.models';

@Injectable({
  providedIn: 'root',
})
export class TradingStateService implements OnDestroy {
  private readonly api = inject(TradingApiService);
  private readonly toast = inject(ToastService);

  public readonly dashboard = signal<TradingDashboard | null>(null);
  public readonly selectedSymbol = signal<string>('BTCUSDT');
  public readonly isLoading = signal<boolean>(false);

  // Computed state slices
  public readonly account = computed(() => this.dashboard()?.account || null);
  public readonly openPositions = computed(() => this.dashboard()?.openPositions || []);
  public readonly pendingOrders = computed(() => this.dashboard()?.pendingOrders || []);
  public readonly watchlist = computed(() => this.dashboard()?.watchlist || []);
  public readonly quotes = computed(() => this.dashboard()?.quotes || []);
  public readonly selectedQuote = computed(() => {
    const list = this.quotes();
    const sym = this.selectedSymbol();
    return list.find((q) => q.symbol.toUpperCase() === sym.toUpperCase()) || list[0] || null;
  });

  public readonly totalUnrealizedPnl = computed(() => {
    return this.openPositions().reduce((sum, p) => sum + p.unrealizedPnl, 0);
  });

  private tickerTimer: any = null;

  constructor() {
    this.loadDashboard(this.selectedSymbol());
    this.startLiveBackendPolling();
  }

  public loadDashboard(symbol: string = 'BTCUSDT'): void {
    this.isLoading.set(true);
    this.selectedSymbol.set(symbol);

    this.api.getDashboard(symbol).subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  public setSymbol(sym: string): void {
    this.selectedSymbol.set(sym);
    const quote = this.selectedQuote();
    if (quote) {
      this.dashboard.update((curr) => (curr ? { ...curr, selectedQuote: quote } : null));
    } else {
      this.api.getQuote(sym).subscribe({
        next: (q) => {
          if (q) {
            this.addOrMergeQuote(q);
          }
        },
      });
    }
  }

  public addOrMergeQuote(quote: TradingQuote): void {
    this.dashboard.update((curr) => {
      if (!curr) return null;
      const existingIdx = curr.quotes.findIndex(
        (q) => q.symbol.toUpperCase() === quote.symbol.toUpperCase()
      );
      let updatedQuotes: TradingQuote[];
      if (existingIdx >= 0) {
        updatedQuotes = [...curr.quotes];
        updatedQuotes[existingIdx] = { ...updatedQuotes[existingIdx], ...quote };
      } else {
        updatedQuotes = [quote, ...curr.quotes];
      }
      return {
        ...curr,
        quotes: updatedQuotes,
      };
    });
  }

  public placeOrder(order: PlaceOrderRequest): void {
    this.isLoading.set(true);
    this.api.placeOrder(order).subscribe({
      next: (res) => {
        this.toast.success('Order Placed', `${order.side === 1 ? 'BUY' : 'SELL'} ${order.quantity} ${order.symbol} executed.`);
        
        // Optimistic local state update for real-time responsiveness
        const currentPrice = order.price || this.selectedQuote()?.price || 100;
        const initialMargin = (order.quantity * currentPrice) / (order.leverage || 1);

        const newPos: TradingPosition = {
          id: 'pos-' + Date.now(),
          accountId: this.account()?.id || 'acc-1',
          symbol: order.symbol,
          assetName: order.assetName || order.symbol,
          assetClass: order.assetClass || AssetClass.Crypto,
          side: order.side,
          quantity: order.quantity,
          entryPrice: currentPrice,
          currentPrice: currentPrice,
          leverage: order.leverage,
          initialMargin: initialMargin,
          unrealizedPnl: 0,
          realizedPnl: 0,
          stopLoss: order.stopLoss,
          takeProfit: order.takeProfit,
          status: TradingPositionStatus.Open,
          openedAtUtc: new Date().toISOString(),
        };

        this.dashboard.update((curr) => {
          if (!curr) return null;
          const updatedPositions = [newPos, ...curr.openPositions];
          const newMarginUsed = curr.account.marginUsed + initialMargin;
          const newFreeMargin = Math.max(0, curr.account.equity - newMarginUsed);

          return {
            ...curr,
            openPositions: updatedPositions,
            account: {
              ...curr.account,
              marginUsed: newMarginUsed,
              freeMargin: newFreeMargin,
            },
          };
        });

        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  public closePosition(req: ClosePositionRequest): void {
    this.api.closePosition(req).subscribe({
      next: () => {
        this.toast.success('Position Closed', 'Position successfully liquidated at market price.');
        this.dashboard.update((curr) => {
          if (!curr) return null;
          const closed = curr.openPositions.find((p) => p.id === req.positionId);
          const filtered = curr.openPositions.filter((p) => p.id !== req.positionId);
          const pnl = closed?.unrealizedPnl || 0;
          const returnedMargin = closed?.initialMargin || 0;

          return {
            ...curr,
            openPositions: filtered,
            account: {
              ...curr.account,
              cashBalance: curr.account.cashBalance + pnl,
              equity: curr.account.equity + pnl,
              marginUsed: Math.max(0, curr.account.marginUsed - returnedMargin),
              freeMargin: curr.account.freeMargin + returnedMargin + pnl,
              realizedPnl: curr.account.realizedPnl + pnl,
            },
          };
        });
      },
    });
  }

  public modifyPosition(req: ModifyPositionRequest): void {
    this.api.modifyPosition(req).subscribe({
      next: () => {
        this.toast.success('SL/TP Updated', 'Position risk parameters modified successfully.');
        this.dashboard.update((curr) => {
          if (!curr) return null;
          const updated = curr.openPositions.map((p) => {
            if (p.id === req.positionId) {
              return {
                ...p,
                stopLoss: req.stopLoss !== undefined ? req.stopLoss : p.stopLoss,
                takeProfit: req.takeProfit !== undefined ? req.takeProfit : p.takeProfit,
              };
            }
            return p;
          });
          return { ...curr, openPositions: updated };
        });
      },
    });
  }

  public cancelOrder(req: CancelOrderRequest): void {
    this.api.cancelOrder(req).subscribe({
      next: () => {
        this.toast.info('Order Cancelled', 'Pending order removed from queue.');
        this.dashboard.update((curr) => {
          if (!curr) return null;
          return {
            ...curr,
            pendingOrders: curr.pendingOrders.filter((o) => o.id !== req.orderId),
          };
        });
      },
    });
  }

  public toggleWatchlist(symbol: string, assetName: string, assetClass: AssetClass): void {
    this.api.toggleWatchlist(symbol, assetName, assetClass).subscribe({
      next: () => {
        this.dashboard.update((curr) => {
          if (!curr) return null;
          const quotes = curr.quotes.map((q) =>
            q.symbol.toUpperCase() === symbol.toUpperCase() ? { ...q, isWatchlisted: !q.isWatchlisted } : q
          );
          const exists = curr.watchlist.some((w) => w.symbol.toUpperCase() === symbol.toUpperCase());
          const watchlist = exists
            ? curr.watchlist.filter((w) => w.symbol.toUpperCase() !== symbol.toUpperCase())
            : [...curr.watchlist, { id: 'w_' + Date.now(), symbol, assetName, assetClass, displayOrder: 99 }];

          return { ...curr, quotes, watchlist };
        });
      },
    });
  }

  public resetBalance(newBalance: number): void {
    this.api.resetBalance({ newBalance }).subscribe({
      next: () => {
        this.toast.success('Balance Reset', `Demo balance set to $${newBalance.toLocaleString()}.`);
        this.loadDashboard(this.selectedSymbol());
      },
    });
  }

  private startLiveBackendPolling(): void {
    if (this.tickerTimer) {
      clearInterval(this.tickerTimer);
    }
    // Poll the real backend every 3 seconds to sync live exchange prices and account positions
    this.tickerTimer = setInterval(() => {
      this.syncLiveBackendStatus();
    }, 3000);
  }

  public syncLiveBackendStatus(): void {
    const symbol = this.selectedSymbol();
    this.api.getLiveStatus(symbol).subscribe({
      next: (res: any) => {
        if (!res) return;
        this.dashboard.update((curr) => {
          if (!curr) return null;

          const updatedQuote = res.selectedQuote ?? res.SelectedQuote;
          const openPositions = res.openPositions ?? res.OpenPositions ?? curr.openPositions;
          const closedPositions = res.closedPositions ?? res.ClosedPositions ?? curr.closedPositions;
          const pendingOrders = res.pendingOrders ?? res.PendingOrders ?? curr.pendingOrders;
          const account = res.account ?? res.Account ?? curr.account;

          let updatedQuotes = curr.quotes;
          if (updatedQuote) {
            const idx = updatedQuotes.findIndex(
              (q) => q.symbol.toUpperCase() === (updatedQuote.symbol ?? '').toUpperCase()
            );
            if (idx >= 0) {
              updatedQuotes = [...updatedQuotes];
              updatedQuotes[idx] = { ...updatedQuotes[idx], ...updatedQuote };
            }
          }

          return {
            ...curr,
            account,
            openPositions,
            closedPositions,
            pendingOrders,
            selectedQuote: updatedQuote ?? curr.selectedQuote,
            quotes: updatedQuotes,
          };
        });
      },
      error: () => {
        // Silently tolerate background poll hiccups
      },
    });
  }

  ngOnDestroy(): void {
    if (this.tickerTimer) {
      clearInterval(this.tickerTimer);
    }
  }
}
