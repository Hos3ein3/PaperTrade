import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MobileNavComponent } from './mobile-nav/mobile-nav.component';
import { ToastContainerComponent } from '../shared/components/toast-container/toast-container.component';
import { NotificationDrawerComponent } from '../features/notifications/components/notification-drawer/notification-drawer.component';
import { LoadingOverlayComponent } from '../shared/components/loading-overlay/loading-overlay.component';
import { SignalrNotificationService } from '../core/notifications/signalr-notification.service';
import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavbarComponent,
    SidebarComponent,
    MobileNavComponent,
    ToastContainerComponent,
    NotificationDrawerComponent,
    LoadingOverlayComponent,
  ],
  templateUrl: './app-layout.component.html',
})
export class AppLayoutComponent implements OnInit, OnDestroy {
  public readonly sidebarOpen = signal<boolean>(false);
  public readonly notificationsOpen = signal<boolean>(false);

  private readonly signalr = inject(SignalrNotificationService);
  private readonly auth = inject(AuthService);

  ngOnInit(): void {
    const user = this.auth.currentUser();
    this.signalr.startConnection(user?.id);
  }

  ngOnDestroy(): void {
    this.signalr.stopConnection();
  }
}
