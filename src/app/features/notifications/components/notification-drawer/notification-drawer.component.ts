import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationStateService, UserNotification } from '../../../../core/notifications/notification-state.service';

@Component({
  selector: 'app-notification-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-drawer.component.html'
})
export class NotificationDrawerComponent {
  public readonly isOpen = input<boolean>(false);
  public readonly closed = output<void>();

  public readonly state = inject(NotificationStateService);

  public unreadCount(): number {
    return this.state.unreadCount();
  }

  public notifications() {
    return this.state.notifications();
  }

  public markAllRead(): void {
    this.state.markAllRead();
  }

  public deleteRead(): void {
    this.state.deleteReadNotifications();
  }

  public deleteNotification(id: string): void {
    this.state.deleteNotification(id);
  }

  public sendTest(): void {
    this.state.sendTest();
  }
}
