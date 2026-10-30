import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TradingStateService } from '../../services/trading-state.service';
import {
  AssetClass,
  TradingOrderSide,
  TradingOrderType,
  PlaceOrderRequest,
} from '../../models/trading.models';

export interface TakeProfitTarget {
  id: number;
  price: number | null;
  percent: number;
}

export type SizingMode = 'units' | 'margin' | 'percent' | 'total';

@Component({
  selector: 'app-order-ticket',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-ticket.component.html',
})
export class OrderTicketComponent {
  public readonly state = inject(TradingStateService);
  protected readonly Math = Math;

  public readonly TradingOrderSide = TradingOrderSide;
  public readonly TradingOrderType = TradingOrderType;

  public readonly side = signal<TradingOrderSide>(TradingOrderSide.Buy);
  public readonly orderType = signal<TradingOrderType>(TradingOrderType.Market);
  public readonly leverage = signal<number>(10);
  public readonly isMultiTp = signal<boolean>(false);

  // Sizing Mode: 'units' | 'margin' | 'percent' | 'total' (Matching MVC Trade.cshtml)
  public sizeMode: SizingMode = 'percent';
  public mainInputValue: number = 25; // default 25%
  public quantity: number = 0.1;
  public customPrice?: number;
  public stopLoss?: number;
  public takeProfit?: number;

  // Dynamic Multi-Level Take Profit (User can add and remove levels)
  public tpTargets: TakeProfitTarget[] = [
    { id: 1, price: null, percent: 60 },
    { id: 2, price: null, percent: 40 },
  ];

  public readonly currentPrice = computed(() => {
    return this.state.selectedQuote()?.price || 67450;
  });

  public readonly activeExecutionPrice = computed(() => {
    return this.orderType() === TradingOrderType.Market
      ? this.currentPrice()
      : this.customPrice || this.currentPrice();
  });

  public readonly freeMargin = computed(() => {
    return this.state.account()?.freeMargin || 50000;
  });

  public readonly notionalValue = computed(() => {
    return (this.quantity || 0) * this.activeExecutionPrice();
  });

  public readonly marginRequired = computed(() => {
    return this.notionalValue() / (this.leverage() || 1);
  });

  public readonly balancePercentage = computed(() => {
    const free = this.freeMargin();
    if (free <= 0) return 0;
    return (this.marginRequired() / free) * 100;
  });

  public readonly maxAffordableQuantity = computed(() => {
    const free = this.freeMargin();
    const price = this.activeExecutionPrice() || 1;
    return (free * this.leverage()) / price;
  });

  public readonly totalTpAllocation = computed(() => {
    return this.tpTargets.reduce((sum, t) => sum + (Number(t.percent) || 0), 0);
  });

  constructor() {
    this.recalculateFromMode();
  }

  public setSizingMode(mode: SizingMode): void {
    this.sizeMode = mode;
    if (mode === 'percent') {
      this.mainInputValue = Math.min(100, Math.max(1, Math.round(this.balancePercentage()) || 25));
    } else if (mode === 'units') {
      this.mainInputValue = Number(this.quantity.toFixed(4));
    } else if (mode === 'margin') {
      this.mainInputValue = Number(this.marginRequired().toFixed(2));
    } else if (mode === 'total') {
      this.mainInputValue = Number(this.notionalValue().toFixed(2));
    }
    this.recalculateFromMode();
  }

  public onMainInputChange(val: number): void {
    this.mainInputValue = val;
    this.recalculateFromMode();
  }

  public setSliderPreset(pct: number): void {
    this.sizeMode = 'percent';
    this.mainInputValue = pct;
    this.recalculateFromMode();
  }

  public recalculateFromMode(): void {
    const free = this.freeMargin();
    const price = this.activeExecutionPrice() || 1;
    const lev = this.leverage() || 1;

    if (this.sizeMode === 'percent') {
      const pct = Math.min(100, Math.max(0.1, Number(this.mainInputValue) || 10));
      const margin = (free * pct) / 100;
      const notional = margin * lev;
      this.quantity = Number((notional / price).toFixed(4));
    } else if (this.sizeMode === 'units') {
      this.quantity = Math.max(0.0001, Number(this.mainInputValue) || 0.1);
    } else if (this.sizeMode === 'margin') {
      const margin = Math.max(1, Number(this.mainInputValue) || 100);
      const notional = margin * lev;
      this.quantity = Number((notional / price).toFixed(4));
    } else if (this.sizeMode === 'total') {
      const notional = Math.max(1, Number(this.mainInputValue) || 1000);
      this.quantity = Number((notional / price).toFixed(4));
    }
  }

  // --- Dynamic Multi-Level Take Profit Methods ---
  public addTpLevel(): void {
    const nextId = this.tpTargets.length + 1;
    const price = this.activeExecutionPrice();
    const isBuy = this.side() === TradingOrderSide.Buy;
    // Step further by 2% per added level
    const step = 0.02 * nextId;
    const defaultPrice = isBuy ? price * (1 + step) : price * (1 - step);

    // Rebalance percentage
    const newCount = this.tpTargets.length + 1;
    const splitPct = Math.floor(100 / newCount);
    this.tpTargets.forEach((t) => (t.percent = splitPct));

    const remainder = 100 - splitPct * this.tpTargets.length;
    this.tpTargets.push({
      id: nextId,
      price: Number(defaultPrice.toFixed(2)),
      percent: remainder > 0 ? remainder : splitPct,
    });
  }

  public removeTpLevel(index: number): void {
    if (this.tpTargets.length <= 1) return;
    this.tpTargets.splice(index, 1);
    // Re-index
    this.tpTargets.forEach((t, i) => (t.id = i + 1));
    // Rebalance to 100%
    const splitPct = Math.floor(100 / this.tpTargets.length);
    this.tpTargets.forEach((t) => (t.percent = splitPct));
    this.tpTargets[this.tpTargets.length - 1].percent += 100 - splitPct * this.tpTargets.length;
  }

  public applyRiskReward(ratio: number): void {
    const entry = this.activeExecutionPrice();

    if (this.side() === TradingOrderSide.Buy) {
      if (!this.stopLoss || this.stopLoss >= entry) {
        this.stopLoss = Number((entry * 0.985).toFixed(2));
      }
      const risk = entry - this.stopLoss;
      this.takeProfit = Number((entry + risk * ratio).toFixed(2));

      // Update dynamic TP targets
      this.tpTargets.forEach((t, idx) => {
        const mult = ratio * (0.6 + idx * 0.4);
        t.price = Number((entry + risk * mult).toFixed(2));
      });
    } else {
      if (!this.stopLoss || this.stopLoss <= entry) {
        this.stopLoss = Number((entry * 1.015).toFixed(2));
      }
      const risk = this.stopLoss - entry;
      this.takeProfit = Number((entry - risk * ratio).toFixed(2));

      // Update dynamic TP targets
      this.tpTargets.forEach((t, idx) => {
        const mult = ratio * (0.6 + idx * 0.4);
        t.price = Number((entry - risk * mult).toFixed(2));
      });
    }
  }

  public submitOrder(): void {
    const quote = this.state.selectedQuote();
    if (!quote || this.quantity <= 0) return;

    const primaryTp = this.isMultiTp()
      ? this.tpTargets[0]?.price || this.takeProfit
      : this.takeProfit;

    const multipleTakeProfitsJson = this.isMultiTp()
      ? JSON.stringify(
          this.tpTargets
            .filter((t) => t.price && t.price > 0)
            .map((t) => ({ price: t.price, percentage: t.percent }))
        )
      : undefined;

    const req: PlaceOrderRequest = {
      symbol: quote.symbol,
      assetName: quote.assetName,
      assetClass: quote.assetClass,
      side: this.side(),
      orderType: this.orderType(),
      quantity: this.quantity,
      price: this.orderType() === TradingOrderType.Market ? undefined : this.customPrice,
      stopLoss: this.stopLoss,
      takeProfit: primaryTp,
      leverage: this.leverage(),
      multipleTakeProfitsJson,
    };

    this.state.placeOrder(req);
  }
}
