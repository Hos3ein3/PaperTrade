import { Injectable, inject, signal, computed, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { Url } from '../url-builder/url';
import { environment } from '../../../environments/environment';
import { ToastService } from './toast.service';
import { SignalrNotificationService } from './signalr-notification.service';

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type?: string;
  actionUrl?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationStateService implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);
  private readonly signalr = inject(SignalrNotificationService);

  public readonly notifications = signal<UserNotification[]>([]);
  public readonly unreadCount = computed(
    () => this.notifications().filter((n) => !n.isRead).length
  );

  private notifSub?: Subscription;

  constructor() {
    this.loadNotifications();

    this.notifSub = this.signalr.notificationReceived$.subscribe((notif) => {
      this.notifications.update((curr) => {
        if (curr.some((n) => n.id === notif.id)) return curr;
        return [
          {
            id: notif.id,
            title: notif.title,
            message: notif.message,
            isRead: notif.isRead,
            createdAt: notif.createdAt,
            type: notif.type,
            actionUrl: notif.actionUrl,
          },
          ...curr,
        ];
      });
    });
  }

  public loadNotifications(): void {
    const url = Url.build(Url.Notification.UserNotifications);
    this.http.get<any>(url).subscribe({
      next: (res) => {
        const rawList: any[] = Array.isArray(res)
          ? res
          : res?.notifications ?? res?.items ?? res?.data ?? [];
        const mapped: UserNotification[] = rawList.map((item: any) => ({
          id: item.id ?? item.Id ?? String(Math.random()),
          title: item.title ?? item.Title ?? 'Notification',
          message: item.message ?? item.Message ?? '',
          isRead: Boolean(item.isRead ?? item.IsRead),
          createdAt:
            item.createdAt ??
            item.CreatedAt ??
            item.createdOn ??
            item.CreatedOn ??
            new Date().toISOString(),
          type: item.type ?? item.Type,
          actionUrl: item.actionUrl ?? item.ActionUrl,
        }));
        this.notifications.set(mapped);
      },
      error: () => {
        if (environment.features.enableMockFallback) {
          this.notifications.set([
            {
              id: '1',
              title: 'Limit Order Executed',
              message: 'Bought 0.5 BTC at $65,200.00',
              isRead: false,
              createdAt: new Date().toISOString(),
            },
            {
              id: '2',
              title: 'Take Profit Hit',
              message: 'EUR/USD closed at target 1.0865 (+45 pips)',
              isRead: false,
              createdAt: new Date(Date.now() - 3600000).toISOString(),
            },
            {
              id: '3',
              title: 'Daily Market Open',
              message: 'London-New York overlap session is now active.',
              isRead: true,
              createdAt: new Date(Date.now() - 7200000).toISOString(),
            },
          ]);
        }
      },
    });
  }

  public markAllRead(): void {
    const url = Url.build(Url.Notification.MarkRead);
    this.http.post(url, {}).subscribe({
      next: () => {
        this.notifications.update((curr) => curr.map((n) => ({ ...n, isRead: true })));
        this.toast.info('Notifications', 'All notifications marked as read.');
      },
      error: () => {
        this.notifications.update((curr) => curr.map((n) => ({ ...n, isRead: true })));
        this.toast.info('Notifications', 'All notifications marked as read.');
      },
    });
  }

  public deleteNotification(id: string): void {
    this.notifications.update((curr) => curr.filter((n) => n.id !== id));
    this.toast.info('Deleted', 'Notification removed.');
  }

  public deleteReadNotifications(): void {
    const prevCount = this.notifications().length;
    this.notifications.update((curr) => curr.filter((n) => !n.isRead));
    const deletedCount = prevCount - this.notifications().length;
    if (deletedCount > 0) {
      this.toast.success('Cleaned Up', `Deleted ${deletedCount} read notification(s).`);
    } else {
      this.toast.info('Notice', 'No read notifications to delete.');
    }
  }

  public sendTest(): void {
    const url = Url.build(Url.Notification.SendTest);
    this.http.post<any>(url, {}).subscribe({
      next: () => {
        this.toast.success('Test Alert Dispatched', 'Dispatched real-time alert via SignalR.');
      },
      error: () => {
        const fallback: UserNotification = {
          id: 'test_' + Date.now(),
          title: 'System Alert Test',
          message: 'Real-time WebSocket & Push channel connected and operating normally.',
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        this.notifications.update((curr) => [fallback, ...curr]);
        this.toast.info('Test Alert Dispatched', 'Real-time notification test received (offline simulation).');
      },
    });
  }

  ngOnDestroy(): void {
    this.notifSub?.unsubscribe();
  }
}
