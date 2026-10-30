import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ForexApiService } from '../../services/forex-api.service';
import { ForexMarketOverview, CurrencyStrength, EconomicEvent } from '../../models/forex.models';
import { GlassBadgeComponent } from '../../../../shared/components/glass-badge/glass-badge.component';

@Component({
  selector: 'app-forex-market',
  standalone: true,
  imports: [CommonModule, RouterModule, GlassBadgeComponent],
  templateUrl: './forex-market.component.html'
})
export class ForexMarketComponent implements OnInit {
  private readonly api = inject(ForexApiService);

  public readonly overview = signal<ForexMarketOverview | null>(null);
  public readonly strength = signal<CurrencyStrength[]>([]);
  public readonly calendar = signal<EconomicEvent[]>([]);

  ngOnInit(): void {
    this.api.getMarketOverview().subscribe({ next: (res) => this.overview.set(res) });
    this.api.getCurrencyStrength().subscribe({ next: (res) => this.strength.set(res) });
    this.api.getEconomicCalendar().subscribe({ next: (res) => this.calendar.set(res) });
  }
}
