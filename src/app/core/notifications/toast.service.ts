import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  durationMs: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  public readonly toasts = signal<ToastMessage[]>([]);

  public show(title: string, message: string, type: ToastType = 'info', durationMs: number = 4000): void {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    const item: ToastMessage = { id, title, message, type, durationMs };

    this.toasts.update((curr) => [...curr, item]);

    if (durationMs > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, durationMs);
    }
  }

  public success(title: string, message: string): void {
    this.show(title, message, 'success');
  }

  public error(title: string, message: string): void {
    this.show(title, message, 'error', 6000);
  }

  public warning(title: string, message: string): void {
    this.show(title, message, 'warning', 5000);
  }

  public info(title: string, message: string): void {
    this.show(title, message, 'info');
  }

  public dismiss(id: string): void {
    this.toasts.update((curr) => curr.filter((t) => t.id !== id));
  }
}
