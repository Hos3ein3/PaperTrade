import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TradingStateService } from '../../services/trading-state.service';
import { GlassBadgeComponent } from '../../../../shared/components/glass-badge/glass-badge.component';
import { TradingOrderSide, TradingOrderType } from '../../models/trading.models';

@Component({
  selector: 'app-orders-table',
  standalone: true,
  imports: [CommonModule, GlassBadgeComponent],
  templateUrl: './orders-table.component.html'
})
export class OrdersTableComponent {
  public readonly state = inject(TradingStateService);
  public readonly TradingOrderSide = TradingOrderSide;
  public readonly TradingOrderType = TradingOrderType;
}
