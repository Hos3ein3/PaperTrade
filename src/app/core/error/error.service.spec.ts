import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ErrorService } from './error.service';

describe('ErrorService', () => {
  let service: ErrorService;
  let routerMock: { navigate: any };

  beforeEach(() => {
    routerMock = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        ErrorService,
        { provide: Router, useValue: routerMock },
      ],
    });

    service = TestBed.inject(ErrorService);
  });

  it('should initialize with modal closed', () => {
    expect(service.isModalOpen()).toBe(false);
    expect(service.activeModalError()).toBeNull();
  });

  it('should open modal with 403 Forbidden details', () => {
    service.showModal(403, { message: 'Trading restricted for current account.' });

    expect(service.isModalOpen()).toBe(true);
    const active = service.activeModalError();
    expect(active).toBeDefined();
    expect(active?.code).toBe(403);
    expect(active?.title).toBe('Access Forbidden');
    expect(active?.message).toBe('Trading restricted for current account.');
  });

  it('should close active modal', () => {
    service.showModal(500);
    expect(service.isModalOpen()).toBe(true);

    service.closeModal();
    expect(service.isModalOpen()).toBe(false);
    expect(service.activeModalError()).toBeNull();
  });

  it('should navigate to full error page via navigateToError()', () => {
    service.navigateToError(404);
    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['/error', 404],
      expect.objectContaining({ state: expect.anything() })
    );
  });

  it('should build 405 Method Not Allowed error details', () => {
    const detail = service.buildErrorDetail(405);
    expect(detail.code).toBe(405);
    expect(detail.title).toBe('Method & Action Not Allowed');
    expect(detail.correlationId).toBeDefined();
  });
});
