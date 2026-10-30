import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlassModalComponent } from '../../../../shared/components/glass-modal/glass-modal.component';
import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';
import { TradingStateService } from '../../services/trading-state.service';

@Component({
  selector: 'app-balance-reset-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, GlassModalComponent, GlassButtonComponent],
  templateUrl: './balance-reset-dialog.component.html'
})
export class BalanceResetDialogComponent {
  public readonly isOpen = input<boolean>(false);
  public readonly closed = output<void>();

  private readonly state = inject(TradingStateService);

  public readonly presets = [10000, 25000, 50000, 100000];
  public selectedAmount: number = 50000;

  public confirmReset(): void {
    if (this.selectedAmount > 0) {
      this.state.resetBalance(this.selectedAmount);
      this.closed.emit();
    }
  }
}
