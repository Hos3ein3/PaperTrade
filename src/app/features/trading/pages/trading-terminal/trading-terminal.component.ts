import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TradingStateService } from '../../services/trading-state.service';
import { CandlestickChartComponent } from '../../../../shared/components/candlestick-chart/candlestick-chart.component';
import { OrderBookComponent } from '../../../../shared/components/order-book/order-book.component';
import { OrderTicketComponent } from '../../components/order-ticket/order-ticket.component';
import { PositionsTableComponent } from '../../components/positions-table/positions-table.component';
import { OrdersTableComponent } from '../../components/orders-table/orders-table.component';
import { ModifyPositionDialogComponent } from '../../components/modify-position-dialog/modify-position-dialog.component';
import { BalanceResetDialogComponent } from '../../components/balance-reset-dialog/balance-reset-dialog.component';
import { TradingPosition } from '../../models/trading.models';
import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';

@Component({
  selector: 'app-trading-terminal',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CandlestickChartComponent,
    OrderBookComponent,
    OrderTicketComponent,
    PositionsTableComponent,
    OrdersTableComponent,
    ModifyPositionDialogComponent,
    BalanceResetDialogComponent,
    GlassButtonComponent,
  ],
  templateUrl: './trading-terminal.component.html'
})
export class TradingTerminalComponent implements OnInit {
  public readonly state = inject(TradingStateService);
  private readonly route = inject(ActivatedRoute);

  public readonly activeBottomTab = signal<'positions' | 'orders'>('positions');
  public readonly showModifyDialog = signal<boolean>(false);
  public readonly showResetDialog = signal<boolean>(false);
  public readonly selectedPosition = signal<TradingPosition | null>(null);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['symbol']) {
        this.state.setSymbol(params['symbol']);
      }
    });
  }

  public openModifyModal(pos: TradingPosition): void {
    this.selectedPosition.set(pos);
    this.showModifyDialog.set(true);
  }
}
