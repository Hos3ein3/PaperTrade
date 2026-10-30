import { Component, inject, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Subscription, debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';
import { TradingStateService } from '../../services/trading-state.service';
import { TradingApiService } from '../../services/trading-api.service';
import { AssetClass, TradingQuote } from '../../models/trading.models';

@Component({
  selector: 'app-watchlist-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './watchlist-panel.component.html',
})
export class WatchlistPanelComponent implements OnDestroy {
  public readonly state = inject(TradingStateService);
  private readonly api = inject(TradingApiService);
  private readonly router = inject(Router);

  public readonly AssetClass = AssetClass;
  public searchQuery: string = '';
  public readonly selectedCategory = signal<AssetClass | null>(null);
  public readonly isSearching = signal<boolean>(false);

  private readonly searchSubject$ = new Subject<string>();
  private readonly sub = new Subscription();

  constructor() {
    this.sub.add(
      this.searchSubject$
        .pipe(
          debounceTime(250),
          distinctUntilChanged(),
          switchMap((query) => {
            if (!query || query.trim().length < 2) {
              this.isSearching.set(false);
              return of([]);
            }
            this.isSearching.set(true);
            return this.api.searchAssets(query).pipe(
              catchError(() => {
                this.isSearching.set(false);
                return of([]);
              })
            );
          })
        )
        .subscribe({
          next: (results) => {
            this.isSearching.set(false);
            if (results && results.length > 0) {
              results.forEach((q) => this.state.addOrMergeQuote(q));
            }
          },
          error: () => this.isSearching.set(false),
        })
    );
  }

  public onSearchChange(val: string): void {
    this.searchQuery = val;
    this.searchSubject$.next(val);
  }

  public getFeedSource(quote: TradingQuote): string {
    if (quote.feedSource) return quote.feedSource;
    switch (quote.assetClass) {
      case AssetClass.Crypto:
        return 'Binance';
      case AssetClass.Forex:
        return 'Oanda';
      case AssetClass.Stock:
        return 'AlphaVantage';
      case AssetClass.Index:
        return 'CBOE / Yahoo';
      case AssetClass.Future:
        return 'NYMEX';
      default:
        return 'Exchange';
    }
  }

  public isSimulated(quote: TradingQuote): boolean {
    if (typeof quote.isSimulated === 'boolean') return quote.isSimulated;
    return (
      quote.assetClass === AssetClass.Stock ||
      quote.assetClass === AssetClass.Index ||
      quote.assetClass === AssetClass.Future
    );
  }

  public readonly filteredQuotes = computed(() => {
    let list = this.state.quotes();
    const cat = this.selectedCategory();
    const q = this.searchQuery.trim().toLowerCase();

    if (cat !== null) {
      list = list.filter((item) => item.assetClass === cat);
    }

    if (q) {
      list = list.filter(
        (item) =>
          item.symbol.toLowerCase().includes(q) ||
          item.assetName.toLowerCase().includes(q)
      );
    }

    return list;
  });

  public selectAsset(quote: TradingQuote): void {
    this.state.setSymbol(quote.symbol);
    this.router.navigate(['/trading/trade'], {
      queryParams: { symbol: quote.symbol },
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
