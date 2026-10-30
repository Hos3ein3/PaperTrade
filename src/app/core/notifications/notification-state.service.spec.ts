import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NotificationStateService } from './notification-state.service';
import { SignalrNotificationService } from './signalr-notification.service';
import { Subject } from 'rxjs';

describe('NotificationStateService', () => {
  let service: NotificationStateService;
  let httpMock: HttpTestingController;
  let mockSignalr: { notificationReceived$: Subject<any> };

  beforeEach(() => {
    mockSignalr = {
      notificationReceived$: new Subject<any>(),
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        NotificationStateService,
        { provide: SignalrNotificationService, useValue: mockSignalr },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(NotificationStateService);

    // Handle initial load request
    const req = httpMock.expectOne((r) => r.url.includes('notification'));
    req.flush([
      { id: '1', title: 'Order Executed', message: 'BTC bought', isRead: false },
      { id: '2', title: 'Target Hit', message: 'Take profit triggered', isRead: true },
      { id: '3', title: 'Market Open', message: 'London open', isRead: true },
    ]);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should calculate unreadCount correctly', () => {
    expect(service.unreadCount()).toBe(1);
    expect(service.notifications().length).toBe(3);
  });

  it('should delete a single notification', () => {
    service.deleteNotification('2');
    expect(service.notifications().length).toBe(2);
    expect(service.notifications().some((n) => n.id === '2')).toBe(false);
  });

  it('should delete all read notifications and keep unread ones', () => {
    service.deleteReadNotifications();
    expect(service.notifications().length).toBe(1);
    expect(service.notifications()[0].id).toBe('1');
    expect(service.unreadCount()).toBe(1);
  });
});
