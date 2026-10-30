import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TradingApiService } from '../../services/trading-api.service';
import { StatMetricComponent } from '../../../../shared/components/stat-metric/stat-metric.component';
import { TradingHistorySummary } from '../../models/trading.models';
import { PnlFormatPipe } from '../../../../shared/pipes/pnl-format.pipe';

@Component({
  selector: 'app-trading-analytics',
  standalone: true,
  imports: [CommonModule, StatMetricComponent, PnlFormatPipe],
  templateUrl: './trading-analytics.component.html'
})
export class TradingAnalyticsComponent implements OnInit {
  private readonly api = inject(TradingApiService);

  public readonly summary = signal<TradingHistorySummary | null>(null);

  ngOnInit(): void {
    this.api.getHistory().subscribe({
      next: (res) => {
        if (res.summary) {
          this.summary.set(res.summary);
        }
      },
    });
  }
}
