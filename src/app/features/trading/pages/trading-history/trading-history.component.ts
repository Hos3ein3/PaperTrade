import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TradingApiService } from '../../services/trading-api.service';
import { GlassBadgeComponent } from '../../../../shared/components/glass-badge/glass-badge.component';
import { GlassModalComponent } from '../../../../shared/components/glass-modal/glass-modal.component';
import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';
import { PnlFormatPipe } from '../../../../shared/pipes/pnl-format.pipe';
import { CetDatePipe } from '../../../../shared/pipes/cet-date.pipe';
import {
  AssetClass,
  TradingHistoryItem,
  TradingHistorySummary,
  TradingOrderSide,
} from '../../models/trading.models';

export interface AssetClassPnl {
  assetClass: AssetClass;
  name: string;
  pnl: number;
  tradesCount: number;
  barPercent: number;
}

@Component({
  selector: 'app-trading-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GlassBadgeComponent,
    GlassModalComponent,
    GlassButtonComponent,
    PnlFormatPipe,
    CetDatePipe,
  ],
  templateUrl: './trading-history.component.html',
})
export class TradingHistoryComponent implements OnInit {
  private readonly api = inject(TradingApiService);
  public readonly TradingOrderSide = TradingOrderSide;
  public readonly AssetClass = AssetClass;
  protected readonly Math = Math;

  public readonly trades = signal<TradingHistoryItem[]>([]);
  public readonly summary = signal<TradingHistorySummary | null>(null);

  public searchFilter: string = '';
  public outcomeFilter: string = '';
  public sideFilter: TradingOrderSide | null = null;
  public assetClassFilter: AssetClass | null = null;

  public readonly showReceiptModal = signal<boolean>(false);
  public readonly selectedTrade = signal<TradingHistoryItem | null>(null);

  // --- Computed Analytics ---
  public readonly totalTradesCount = computed(() => this.trades().length);

  public readonly totalWins = computed(
    () => this.trades().filter((t) => t.realizedPnl > 0).length
  );

  public readonly totalLosses = computed(
    () => this.trades().filter((t) => t.realizedPnl < 0).length
  );

  public readonly totalBreakEven = computed(
    () => this.trades().filter((t) => t.realizedPnl === 0).length
  );

  public readonly winRate = computed(() => {
    const total = this.totalTradesCount();
    return total > 0 ? (this.totalWins() / total) * 100 : 0;
  });

  public readonly totalRealizedPnl = computed(() => {
    return this.trades().reduce((sum, t) => sum + (t.realizedPnl || 0), 0);
  });

  public readonly bestTrade = computed(() => {
    if (this.trades().length === 0) return 0;
    return Math.max(...this.trades().map((t) => t.realizedPnl));
  });

  public readonly worstTrade = computed(() => {
    if (this.trades().length === 0) return 0;
    return Math.min(...this.trades().map((t) => t.realizedPnl));
  });

  public readonly profitFactor = computed(() => {
    const wins = this.trades().filter((t) => t.realizedPnl > 0).reduce((sum, t) => sum + t.realizedPnl, 0);
    const losses = Math.abs(this.trades().filter((t) => t.realizedPnl < 0).reduce((sum, t) => sum + t.realizedPnl, 0));
    if (losses === 0) return wins > 0 ? 99.9 : 1.0;
    return wins / losses;
  });

  // Donut SVG circumference = 2 * PI * 36 ≈ 226.2
  public readonly donutCircumference = 226.2;
  public readonly donutWinOffset = computed(() => {
    const rate = this.winRate() / 100;
    return this.donutCircumference * (1 - rate);
  });

  // Cumulative PnL Points for SVG Polyline (viewBox 0 0 500 120)
  public readonly cumulativeSvgPath = computed(() => {
    const list = [...this.trades()].reverse();
    if (list.length === 0) return { line: '0,60 500,60', area: '0,60 500,60 500,120 0,120' };

    let running = 0;
    const values: number[] = [0];
    for (const t of list) {
      running += t.realizedPnl;
      values.push(running);
    }

    const min = Math.min(...values, 0);
    const max = Math.max(...values, 100);
    const range = (max - min) || 1;

    const points = values.map((val, idx) => {
      const x = (idx / (values.length - 1)) * 500;
      const y = 110 - ((val - min) / range) * 100;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const linePath = points.join(' ');
    const areaPath = `0,120 ${linePath} 500,120`;

    return { line: linePath, area: areaPath };
  });

  // Realized PnL breakdown by asset class
  public readonly assetClassBreakdown = computed<AssetClassPnl[]>(() => {
    const classes = [
      { id: AssetClass.Crypto, name: 'Crypto' },
      { id: AssetClass.Forex, name: 'Forex' },
      { id: AssetClass.Stock, name: 'Stocks' },
      { id: AssetClass.Future, name: 'Commodities' },
      { id: AssetClass.Index, name: 'Indices' },
    ];

    let maxAbs = 1;
    const items = classes.map((c) => {
      const matching = this.trades().filter((t) => t.assetClass === c.id);
      const pnl = matching.reduce((sum, t) => sum + t.realizedPnl, 0);
      if (Math.abs(pnl) > maxAbs) maxAbs = Math.abs(pnl);
      return {
        assetClass: c.id,
        name: c.name,
        pnl,
        tradesCount: matching.length,
        barPercent: 0,
      };
    });

    items.forEach((item) => {
      item.barPercent = Math.min(100, Math.round((Math.abs(item.pnl) / maxAbs) * 100));
    });

    return items;
  });

  public readonly filteredTrades = computed(() => {
    let list = this.trades();
    const q = this.searchFilter.trim().toLowerCase();
    const outcome = this.outcomeFilter;
    const side = this.sideFilter;
    const assetClass = this.assetClassFilter;

    if (q) {
      list = list.filter(
        (t) =>
          t.symbol.toLowerCase().includes(q) ||
          t.assetName.toLowerCase().includes(q)
      );
    }
    if (outcome) {
      list = list.filter(
        (t) => t.outcomeBadge.toUpperCase() === outcome.toUpperCase()
      );
    }
    if (side !== null) {
      list = list.filter((t) => t.side === side);
    }
    if (assetClass !== null) {
      list = list.filter((t) => t.assetClass === assetClass);
    }

    return list;
  });

  ngOnInit(): void {
    this.loadHistory();
  }

  public loadHistory(): void {
    this.api.getHistory().subscribe({
      next: (res) => {
        this.trades.set(res.trades);
        this.summary.set(res.summary);
      },
    });
  }

  public getPriceDelta(t: TradingHistoryItem): number {
    const exit = t.closePrice || t.currentPrice;
    return t.side === TradingOrderSide.Buy
      ? exit - t.entryPrice
      : t.entryPrice - exit;
  }
}
