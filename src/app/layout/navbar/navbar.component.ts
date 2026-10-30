import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/theme/theme.service';
import { TradingStateService } from '../../features/trading/services/trading-state.service';
import { NotificationStateService } from '../../core/notifications/notification-state.service';
import { PnlFormatPipe } from '../../shared/pipes/pnl-format.pipe';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, PnlFormatPipe],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  public readonly auth = inject(AuthService);
  public readonly theme = inject(ThemeService);
  public readonly state = inject(TradingStateService);
  public readonly notificationState = inject(NotificationStateService);

  public readonly menuToggled = output<void>();
  public readonly notificationsClicked = output<void>();
}
