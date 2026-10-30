import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TradingStateService } from '../../services/trading-state.service';
import { StatMetricComponent } from '../../../../shared/components/stat-metric/stat-metric.component';
import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';
import { WatchlistPanelComponent } from '../../components/watchlist-panel/watchlist-panel.component';
import { PositionsTableComponent } from '../../components/positions-table/positions-table.component';
import { OrdersTableComponent } from '../../components/orders-table/orders-table.component';
import { BalanceResetDialogComponent } from '../../components/balance-reset-dialog/balance-reset-dialog.component';
import { ModifyPositionDialogComponent } from '../../components/modify-position-dialog/modify-position-dialog.component';
import { TradingPosition } from '../../models/trading.models';
import { PnlFormatPipe } from '../../../../shared/pipes/pnl-format.pipe';

@Component({
  selector: 'app-trading-hub',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatMetricComponent,
    GlassButtonComponent,
    WatchlistPanelComponent,
    PositionsTableComponent,
    OrdersTableComponent,
    BalanceResetDialogComponent,
    ModifyPositionDialogComponent,
    PnlFormatPipe,
  ],
  templateUrl: './trading-hub.component.html'
})
export class TradingHubComponent {
  public readonly state = inject(TradingStateService);

  public readonly showResetDialog = signal<boolean>(false);
  public readonly showModifyDialog = signal<boolean>(false);
  public readonly selectedPosition = signal<TradingPosition | null>(null);

  public openModifyModal(pos: TradingPosition): void {
    this.selectedPosition.set(pos);
    this.showModifyDialog.set(true);
  }
}
