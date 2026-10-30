import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ForexApiService } from '../../services/forex-api.service';
import { ForexTradeDashboard, ForexTradeDirection } from '../../models/forex.models';
import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';
import { GlassBadgeComponent } from '../../../../shared/components/glass-badge/glass-badge.component';
import { PnlFormatPipe } from '../../../../shared/pipes/pnl-format.pipe';
import { ToastService } from '../../../../core/notifications/toast.service';

@Component({
  selector: 'app-forex-trade',
  standalone: true,
  imports: [CommonModule, FormsModule, GlassButtonComponent, GlassBadgeComponent, PnlFormatPipe],
  templateUrl: './forex-trade.component.html'
})
export class ForexTradeComponent implements OnInit {
  private readonly api = inject(ForexApiService);
  private readonly toast = inject(ToastService);

  public readonly ForexTradeDirection = ForexTradeDirection;
  public readonly dashboard = signal<ForexTradeDashboard | null>(null);

  public calcSymbol = 'EUR/USD';
  public calcBalance = 50000;
  public calcRiskPercent = 1.0;
  public calcStopLossPips = 25;

  public computedLots(): number {
    const riskUsd = (this.calcBalance * this.calcRiskPercent) / 100;
    const lots = riskUsd / (this.calcStopLossPips * 10);
    return Math.max(0.01, Number(lots.toFixed(2)));
  }

  ngOnInit(): void {
    this.api.getTradeDashboard().subscribe({ next: (res) => this.dashboard.set(res) });
  }

  public quickOrder(dir: ForexTradeDirection): void {
    const lots = this.computedLots();
    this.api.placeOrder({ symbol: this.calcSymbol, direction: dir, lotSize: lots }).subscribe({
      next: () => {
        this.toast.success('Forex Order', `${dir === ForexTradeDirection.Buy ? 'BUY' : 'SELL'} ${lots} lots of ${this.calcSymbol} opened.`);
      },
    });
  }

  public closeTrade(id: string): void {
    this.api.closeTrade(id).subscribe({
      next: () => {
        this.toast.success('Trade Closed', 'Forex trade closed.');
        this.dashboard.update((curr) => curr ? { ...curr, openTrades: curr.openTrades.filter((t) => t.id !== id) } : null);
      },
    });
  }

  public activateKillSwitch(): void {
    this.api.activateKillSwitch().subscribe({
      next: () => {
        this.toast.warning('Kill Switch Activated', 'All Forex positions liquidated and orders cancelled.');
        this.dashboard.update((curr) => curr ? { ...curr, openTrades: [] } : null);
      },
    });
  }
}
