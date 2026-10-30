import { Injectable, inject, signal } from '@angular/core';
import { Subject } from 'rxjs';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  HttpTransportType,
  LogLevel,
} from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from '../auth/token-storage.service';
import { ToastService } from './toast.service';

export interface RealtimeNotification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type?: string;
  actionUrl?: string | null;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, string> | null;
}

@Injectable({
  providedIn: 'root',
})
export class SignalrNotificationService {
  private hubConnection: HubConnection | null = null;
  private activeUserId: string | null = null;
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly toast = inject(ToastService);

  public readonly isConnected = signal<boolean>(false);
  public readonly connectionState = signal<string>('Disconnected');
  public readonly notificationReceived$ = new Subject<RealtimeNotification>();

  /**
   * Initializes and starts the SignalR WebSocket/SSE connection to the notification hub.
   * Supports both JWT (sent via accessTokenFactory & query parameter) and Cookies (via withCredentials).
   */
  public async startConnection(userId?: string): Promise<void> {
    if (userId) {
      this.activeUserId = userId;
    }

    if (
      this.hubConnection &&
      (this.hubConnection.state === HubConnectionState.Connected ||
        this.hubConnection.state === HubConnectionState.Connecting)
    ) {
      if (userId && this.hubConnection.state === HubConnectionState.Connected) {
        await this.joinUserGroup(userId);
      }
      return;
    }

    try {
      this.connectionState.set('Connecting');

      const hubUrl = environment.signalrHubUrl || 'http://localhost:5143/hubs/notifications';

      this.hubConnection = new HubConnectionBuilder()
        .withUrl(hubUrl, {
          // Supports JWT Bearer tokens (SignalR client automatically attaches token to HTTP headers
          // and appends ?access_token=... for WebSocket upgrade requests)
          accessTokenFactory: () => this.tokenStorage.getToken() ?? '',
          // Supports Cookie-based authentication (MVC sessions)
          withCredentials: true,
          transport:
            HttpTransportType.WebSockets |
            HttpTransportType.ServerSentEvents |
            HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(LogLevel.Warning)
        .build();

      // Register listener for backend event "ReceiveNotification"
      this.hubConnection.on('ReceiveNotification', (item: any) => {
        const notification: RealtimeNotification = {
          id: item.id ?? item.Id ?? 'notif_' + Date.now(),
          userId: item.userId ?? item.UserId,
          title: item.title ?? item.Title ?? 'New Notification',
          message: item.message ?? item.Message ?? '',
          type: item.type ?? item.Type ?? 'Info',
          actionUrl: item.actionUrl ?? item.ActionUrl ?? null,
          isRead: Boolean(item.isRead ?? item.IsRead),
          createdAt: item.createdAt ?? item.CreatedAt ?? new Date().toISOString(),
          metadata: item.metadata ?? item.Metadata ?? null,
        };

        // Notify subscribers
        this.notificationReceived$.next(notification);

        // Display instant toast popup
        const toastType =
          notification.type?.toLowerCase() === 'trade' || notification.type?.toLowerCase() === 'order'
            ? 'success'
            : notification.type?.toLowerCase() === 'error' || notification.type?.toLowerCase() === 'liquidation'
            ? 'error'
            : notification.type?.toLowerCase() === 'warning'
            ? 'warning'
            : 'info';

        this.toast.show(notification.title, notification.message, toastType, 5000);
      });

      // Lifecycle handlers
      this.hubConnection.onreconnecting(() => {
        this.isConnected.set(false);
        this.connectionState.set('Reconnecting');
      });

      this.hubConnection.onreconnected(() => {
        this.isConnected.set(true);
        this.connectionState.set('Connected');
        const targetUserId = this.activeUserId || userId;
        if (targetUserId) {
          this.joinUserGroup(targetUserId);
        }
      });

      this.hubConnection.onclose(() => {
        this.isConnected.set(false);
        this.connectionState.set('Disconnected');
      });

      await this.hubConnection.start();
      this.isConnected.set(true);
      this.connectionState.set('Connected');

      // Join user group explicitly if userId is provided
      const targetUserId = this.activeUserId || userId;
      if (targetUserId) {
        await this.joinUserGroup(targetUserId);
      }
    } catch (err) {
      this.isConnected.set(false);
      this.connectionState.set('Error');
      console.warn('SignalR notification connection failed (will retry on next activity):', err);
    }
  }

  /**
   * Explicitly joins a user's notification group on the hub.
   */
  public async joinUserGroup(userId: string): Promise<void> {
    if (userId) {
      this.activeUserId = userId;
    }
    if (this.hubConnection?.state === HubConnectionState.Connected && userId) {
      try {
        await this.hubConnection.invoke('JoinUserGroup', userId);
      } catch {
        // Fallback silently if group join fails or method isn't required
      }
    }
  }

  /**
   * Stops the active SignalR connection.
   */
  public async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      try {
        await this.hubConnection.stop();
      } catch {
        // Ignore stop error
      } finally {
        this.hubConnection = null;
        this.isConnected.set(false);
        this.connectionState.set('Disconnected');
      }
    }
  }
}
