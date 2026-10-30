import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastType } from '../../../core/notifications/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.css'
})
export class ToastContainerComponent {
  public readonly toastService = inject(ToastService);

  public dismiss(event: MouseEvent, id: string): void {
    event.stopPropagation();
    event.preventDefault();
    this.toastService.dismiss(id);
  }

  protected toastClasses(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'bg-white/95 dark:bg-emerald-950/90 border-emerald-500/50 text-slate-800 dark:text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.25)]';
      case 'error':
        return 'bg-white/95 dark:bg-rose-950/90 border-rose-500/50 text-slate-800 dark:text-rose-100 shadow-[0_0_20px_rgba(244,63,94,0.25)]';
      case 'warning':
        return 'bg-white/95 dark:bg-amber-950/90 border-amber-500/50 text-slate-800 dark:text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.25)]';
      case 'info':
      default:
        return 'bg-white/95 dark:bg-slate-900/90 border-brand-500/40 text-slate-800 dark:text-slate-100 shadow-[0_0_20px_rgba(20,184,166,0.2)]';
    }
  }

  protected iconColor(type: ToastType): string {
    switch (type) {
      case 'success': return 'text-emerald-500 dark:text-emerald-400';
      case 'error': return 'text-rose-500 dark:text-rose-400';
      case 'warning': return 'text-amber-500 dark:text-amber-400';
      default: return 'text-brand-500 dark:text-brand-400';
    }
  }

  protected toastIcon(type: ToastType): string {
    switch (type) {
      case 'success': return 'fa-solid fa-circle-check';
      case 'error': return 'fa-solid fa-triangle-exclamation';
      case 'warning': return 'fa-solid fa-bell';
      default: return 'fa-solid fa-circle-info';
    }
  }
}
