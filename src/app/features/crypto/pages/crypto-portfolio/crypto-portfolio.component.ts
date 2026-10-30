import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CryptoApiService } from '../../services/crypto-api.service';
import { CryptoPortfolioHolding, CryptoAlert } from '../../models/crypto.models';
import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';
import { GlassBadgeComponent } from '../../../../shared/components/glass-badge/glass-badge.component';
import { GlassModalComponent } from '../../../../shared/components/glass-modal/glass-modal.component';
import { PnlFormatPipe } from '../../../../shared/pipes/pnl-format.pipe';
import { ToastService } from '../../../../core/notifications/toast.service';

@Component({
  selector: 'app-crypto-portfolio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GlassButtonComponent,
    GlassBadgeComponent,
    GlassModalComponent,
    PnlFormatPipe,
  ],
  templateUrl: './crypto-portfolio.component.html'
})
export class CryptoPortfolioComponent implements OnInit {
  private readonly api = inject(CryptoApiService);
  private readonly toast = inject(ToastService);

  public readonly holdings = signal<CryptoPortfolioHolding[]>([]);
  public readonly alerts = signal<CryptoAlert[]>([]);
  public readonly showAlertModal = signal<boolean>(false);

  public newAlertSymbol = 'BTCUSDT';
  public newAlertTarget = 70000;
  public newAlertMsg = 'BTC Target Reached';

  public totalValue(): number {
    return this.holdings().reduce((sum, h) => sum + h.totalValueUsd, 0);
  }

  ngOnInit(): void {
    this.api.getPortfolio().subscribe({ next: (res) => this.holdings.set(res) });
    this.api.getAlerts().subscribe({ next: (res) => this.alerts.set(res) });
  }

  public saveAlert(): void {
    const alert: Partial<CryptoAlert> = {
      symbol: this.newAlertSymbol.toUpperCase(),
      targetValue: Number(this.newAlertTarget),
      message: this.newAlertMsg,
      alertType: 1,
    };

    this.api.createAlert(alert).subscribe({
      next: () => {
        this.toast.success('Alert Created', `Target alert for ${alert.symbol} saved.`);
        this.alerts.update((curr) => [
          ...curr,
          {
            id: 'al_' + Date.now(),
            symbol: alert.symbol!,
            targetValue: alert.targetValue!,
            message: alert.message,
            alertType: 1,
            isTriggered: false,
            createdAt: new Date().toISOString(),
          },
        ]);
        this.showAlertModal.set(false);
      },
    });
  }

  public deleteAlert(id: string): void {
    this.api.deleteAlert(id).subscribe({
      next: () => {
        this.toast.info('Alert Removed', 'Price alert deleted.');
        this.alerts.update((curr) => curr.filter((a) => a.id !== id));
      },
    });
  }
}
