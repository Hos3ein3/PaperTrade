import { HttpInterceptorFn } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Subject, finalize, takeUntil } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private activeRequests = 0;
  public readonly isLoading = signal<boolean>(false);
  public readonly cancel$ = new Subject<void>();

  public show(): void {
    this.activeRequests++;
    this.isLoading.set(true);
  }

  public hide(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    if (this.activeRequests === 0) {
      this.isLoading.set(false);
    }
  }

  public cancelAll(): void {
    this.activeRequests = 0;
    this.isLoading.set(false);
    this.cancel$.next();
  }
}

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  // Bypass polling, background updates, and symbol searches from triggering full-page loading spinners
  const isSilent =
    req.url.includes('quote') ||
    req.url.includes('live-status') ||
    req.url.includes('search') ||
    req.headers.has('X-Silent');

  if (!isSilent) {
    loadingService.show();
  }

  return next(req).pipe(
    takeUntil(loadingService.cancel$),
    finalize(() => {
      if (!isSilent) {
        loadingService.hide();
      }
    })
  );
};
