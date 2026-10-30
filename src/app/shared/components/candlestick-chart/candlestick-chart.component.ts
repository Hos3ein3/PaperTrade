import {
  Component,
  input,
  output,
  signal,
  computed,
  effect,
  inject,
  AfterViewInit,
  OnDestroy,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/theme/theme.service';

declare const TradingView: any;

export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

@Component({
  selector: 'app-candlestick-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './candlestick-chart.component.html',
})
export class CandlestickChartComponent implements AfterViewInit, OnDestroy {
  public readonly symbol = input<string>('BTCUSDT');
  public readonly candles = input<CandleData[]>([]);
  public readonly timeframeChanged = output<string>();

  public readonly themeService = inject(ThemeService);
  private readonly el = inject(ElementRef);

  public readonly chartEngine = signal<'tradingview' | 'canvas'>('tradingview');
  public readonly timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];
  public readonly activeTf = signal<string>('15');

  public readonly hoverX = signal<number | null>(null);
  public readonly hoverY = signal<number | null>(null);
  public readonly hoveredCandle = signal<CandleData | null>(null);

  private readonly defaultCandles = signal<CandleData[]>([]);

  private tvScriptLoaded = false;
  private currentWidget: any = null;

  constructor() {
    // Re-initialize or update TradingView widget when symbol, theme, or engine changes
    effect(() => {
      const sym = this.symbol();
      const isDark = this.themeService.isDark();
      const engine = this.chartEngine();

      if (engine === 'tradingview') {
        setTimeout(() => this.renderTradingViewWidget(sym, isDark), 50);
      }
    });
  }

  ngAfterViewInit(): void {
    this.loadTradingViewScript().then(() => {
      this.renderTradingViewWidget(this.symbol(), this.themeService.isDark());
    });
  }

  private loadTradingViewScript(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof TradingView !== 'undefined') {
        this.tvScriptLoaded = true;
        resolve();
        return;
      }

      const existingScript = document.getElementById('tradingview-widget-script');
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          this.tvScriptLoaded = true;
          resolve();
        });
        return;
      }

      const script = document.createElement('script');
      script.id = 'tradingview-widget-script';
      script.type = 'text/javascript';
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = () => {
        this.tvScriptLoaded = true;
        resolve();
      };
      script.onerror = () => {
        console.warn('TradingView script failed to load, falling back to canvas.');
        this.chartEngine.set('canvas');
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  private getTradingViewSymbol(sym: string): string {
    const s = (sym || '').toUpperCase().trim();
    if (s.includes('/')) {
      return 'FX:' + s.replace('/', '');
    }
    if (s.endsWith('USDT')) {
      return 'BINANCE:' + s;
    }
    if (s === 'EURUSD' || s === 'GBPUSD' || s === 'USDJPY' || s === 'AUDUSD' || s === 'USDCAD' || s === 'USDCHF') {
      return 'FX:' + s;
    }
    if (s === 'XAUUSD' || s === 'GOLD') return 'OANDA:XAUUSD';
    if (s === 'XAGUSD' || s === 'SILVER') return 'OANDA:XAGUSD';
    if (s === 'USOIL' || s === 'WTI') return 'TVC:USOIL';
    if (s === 'BRENT' || s === 'BRENTOIL' || s === 'BRENTOILUSD' || s === 'UKOIL') return 'TVC:UKOIL';
    if (s === 'NATGAS') return 'TVC:NATGAS';
    if (s === 'SPX') return 'SP:SPX';
    if (s === 'NDX') return 'NASDAQ:NDX';
    if (s === 'DJI') return 'DJ:DJI';
    if (s === 'DAX') return 'XETR:DAX';
    if (s === 'FTSE') return 'INDEX:FTSE';
    if (['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'GOOGL', 'META'].includes(s)) {
      return 'NASDAQ:' + s;
    }

    return 'BINANCE:' + (s.endsWith('USDT') ? s : s + 'USDT');
  }

  public renderTradingViewWidget(sym: string, isDark: boolean): void {
    if (typeof TradingView === 'undefined') return;

    const containerId = 'tradingview_chart_container';
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const tvSymbol = this.getTradingViewSymbol(sym);

    try {
      this.currentWidget = new TradingView.widget({
        autosize: true,
        symbol: tvSymbol,
        interval: this.activeTf(),
        timezone: 'Europe/Berlin',
        theme: isDark ? 'dark' : 'light',
        style: '1',
        locale: 'en',
        toolbar_bg: isDark ? '#090d16' : '#f8fafc',
        enable_publishing: false,
        hide_side_toolbar: false,
        allow_symbol_change: true,
        save_image: false,
        container_id: containerId,
      });
    } catch (e) {
      console.warn('TradingView widget initialization fallback:', e);
      this.chartEngine.set('canvas');
    }
  }

  // Fallback Canvas Math & Properties
  public readonly activeCandles = computed(() => {
    const inputCandles = this.candles();
    return inputCandles && inputCandles.length > 0 ? inputCandles : this.defaultCandles();
  });

  public readonly lastCandle = computed(() => {
    const list = this.activeCandles();
    return list.length > 0 ? list[list.length - 1] : null;
  });

  public readonly currentCandleColor = computed(() => {
    const c = this.lastCandle();
    if (!c) return 'text-slate-100';
    return c.close >= c.open ? 'text-emerald-500' : 'text-rose-500';
  });

  public readonly minPrice = computed(() => {
    const c = this.activeCandles();
    if (c.length === 0) return 0;
    return Math.min(...c.map((item) => item.low)) * 0.998;
  });

  public readonly maxPrice = computed(() => {
    const c = this.activeCandles();
    if (c.length === 0) return 100;
    return Math.max(...c.map((item) => item.high)) * 1.002;
  });

  public readonly maxVolume = computed(() => {
    const c = this.activeCandles();
    if (c.length === 0) return 1;
    return Math.max(...c.map((item) => item.volume));
  });

  public readonly priceGridLevels = computed(() => {
    const min = this.minPrice();
    const max = this.maxPrice();
    const range = max - min;
    const steps = 5;
    const levels = [];

    for (let i = 0; i <= steps; i++) {
      const price = min + (range / steps) * i;
      const y = 420 - ((price - min) / (max - min || 1)) * 400;
      levels.push({ price, y });
    }
    return levels;
  });

  public readonly currentPriceY = computed(() => {
    const last = this.lastCandle();
    if (!last) return null;
    const min = this.minPrice();
    const max = this.maxPrice();
    return 420 - ((last.close - min) / (max - min || 1)) * 400;
  });

  public readonly renderedCandles = computed(() => {
    const list = this.activeCandles();
    if (list.length === 0) return [];

    const min = this.minPrice();
    const max = this.maxPrice();
    const maxVol = this.maxVolume() || 1;
    const chartWidth = 940;
    const candleSlotWidth = chartWidth / list.length;
    const width = Math.max(3, candleSlotWidth * 0.7);

    return list.map((c, i) => {
      const x = i * candleSlotWidth + candleSlotWidth / 2;
      const isBullish = c.close >= c.open;
      const wickHighY = 420 - ((c.high - min) / (max - min || 1)) * 400;
      const wickLowY = 420 - ((c.low - min) / (max - min || 1)) * 400;
      const openY = 420 - ((c.open - min) / (max - min || 1)) * 400;
      const closeY = 420 - ((c.close - min) / (max - min || 1)) * 400;
      const bodyY = Math.min(openY, closeY);
      const bodyHeight = Math.max(2, Math.abs(openY - closeY));
      const volHeight = (c.volume / maxVol) * 65;
      const volY = 495 - volHeight;

      return {
        ...c,
        x,
        width,
        wickHighY,
        wickLowY,
        bodyY,
        bodyHeight,
        volY,
        volHeight,
        isBullish,
      };
    });
  });

  public selectTimeframe(tf: string): void {
    this.activeTf.set(tf);
    this.timeframeChanged.emit(tf);
    if (this.chartEngine() === 'tradingview') {
      this.renderTradingViewWidget(this.symbol(), this.themeService.isDark());
    }
  }

  public onMouseMove(event: MouseEvent): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const xRatio = (event.clientX - rect.left) / rect.width;
    const yRatio = (event.clientY - rect.top) / rect.height;

    this.hoverX.set(xRatio * 1000);
    this.hoverY.set(yRatio * 500);

    const candles = this.renderedCandles();
    if (candles.length > 0) {
      const index = Math.min(
        candles.length - 1,
        Math.max(0, Math.floor((this.hoverX()! / 940) * candles.length))
      );
      this.hoveredCandle.set(candles[index]);
    }
  }

  public onMouseLeave(): void {
    this.hoverX.set(null);
    this.hoverY.set(null);
    this.hoveredCandle.set(null);
  }

  ngOnDestroy(): void {
    this.currentWidget = null;
  }
}
