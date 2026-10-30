import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TradingStateService } from '../../services/trading-state.service';
import { GlassBadgeComponent } from '../../../../shared/components/glass-badge/glass-badge.component';
import { PnlFormatPipe } from '../../../../shared/pipes/pnl-format.pipe';
import { TradingOrderSide, TradingPosition } from '../../models/trading.models';

@Component({
  selector: 'app-positions-table',
  standalone: true,
  imports: [CommonModule, GlassBadgeComponent, PnlFormatPipe],
  templateUrl: './positions-table.component.html'
})
export class PositionsTableComponent {
  public readonly state = inject(TradingStateService);
  public readonly TradingOrderSide = TradingOrderSide;

  public readonly modifyClicked = output<TradingPosition>();
}
