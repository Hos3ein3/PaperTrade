import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CryptoApiService } from '../../services/crypto-api.service';
import { CryptoMarketOverview, CryptoFuturesFunding, ArbitrageOpportunity } from '../../models/crypto.models';
import { GlassBadgeComponent } from '../../../../shared/components/glass-badge/glass-badge.component';

@Component({
  selector: 'app-crypto-market',
  standalone: true,
  imports: [CommonModule, RouterModule, GlassBadgeComponent],
  templateUrl: './crypto-market.component.html'
})
export class CryptoMarketComponent implements OnInit {
  private readonly api = inject(CryptoApiService);

  public readonly overview = signal<CryptoMarketOverview | null>(null);
  public readonly futures = signal<CryptoFuturesFunding[]>([]);
  public readonly arbitrage = signal<ArbitrageOpportunity[]>([]);

  ngOnInit(): void {
    this.api.getMarketOverview().subscribe({ next: (res) => this.overview.set(res) });
    this.api.getFutures().subscribe({ next: (res) => this.futures.set(res) });
    this.api.getArbitrage().subscribe({ next: (res) => this.arbitrage.set(res) });
  }
}
