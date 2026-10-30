import { Component, inject, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlassModalComponent } from '../../../../shared/components/glass-modal/glass-modal.component';
import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';
import { TradingStateService } from '../../services/trading-state.service';
import { TradingPosition } from '../../models/trading.models';

@Component({
  selector: 'app-modify-position-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, GlassModalComponent, GlassButtonComponent],
  templateUrl: './modify-position-dialog.component.html'
})
export class ModifyPositionDialogComponent {
  public readonly isOpen = input<boolean>(false);
  public readonly position = input<TradingPosition | null>(null);
  public readonly closed = output<void>();

  private readonly state = inject(TradingStateService);

  public stopLoss?: number;
  public takeProfit?: number;

  constructor() {
    effect(() => {
      const pos = this.position();
      if (pos) {
        this.stopLoss = pos.stopLoss;
        this.takeProfit = pos.takeProfit;
      }
    });
  }

  public calculatePotentialGain(): number {
    const pos = this.position();
    if (!pos || !this.takeProfit) return 0;
    const diff = Math.abs(this.takeProfit - pos.entryPrice);
    return diff * pos.quantity * pos.leverage;
  }

  public calculatePotentialLoss(): number {
    const pos = this.position();
    if (!pos || !this.stopLoss) return 0;
    const diff = Math.abs(pos.entryPrice - this.stopLoss);
    return diff * pos.quantity * pos.leverage;
  }

  public confirmUpdate(): void {
    const pos = this.position();
    if (!pos) return;

    this.state.modifyPosition({
      positionId: pos.id,
      symbol: pos.symbol,
      stopLoss: this.stopLoss ? Number(this.stopLoss) : undefined,
      takeProfit: this.takeProfit ? Number(this.takeProfit) : undefined,
    });

    this.closed.emit();
  }
}
