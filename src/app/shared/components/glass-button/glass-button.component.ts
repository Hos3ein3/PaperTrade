import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'bullish' | 'bearish' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-glass-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './glass-button.component.html'
})
export class GlassButtonComponent {
  public readonly variant = input<ButtonVariant>('primary');
  public readonly size = input<ButtonSize>('md');
  public readonly type = input<'button' | 'submit' | 'reset'>('button');
  public readonly disabled = input<boolean>(false);
  public readonly loading = input<boolean>(false);
  public readonly icon = input<string>('');
  public readonly fullWidth = input<boolean>(false);

  public readonly clicked = output<MouseEvent>();

  protected sizeClasses(): string {
    switch (this.size()) {
      case 'sm': return 'px-3 py-1.5 text-xs';
      case 'lg': return 'px-6 py-3 text-base';
      case 'md':
      default: return 'px-4 py-2 text-sm';
    }
  }

  protected variantClasses(): string {
    switch (this.variant()) {
      case 'primary':
        return 'bg-brand-600 hover:bg-brand-500 text-white border-brand-400/40 shadow-glow-brand hover:shadow-[0_0_30px_rgba(20,184,166,0.5)]';
      case 'bullish':
        return 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/40 shadow-glow-bullish hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]';
      case 'bearish':
        return 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400/40 shadow-glow-bearish hover:shadow-[0_0_30px_rgba(244,63,94,0.5)]';
      case 'secondary':
        return 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 dark:bg-white/10 dark:hover:bg-white/15 dark:text-slate-200 dark:border-white/10 backdrop-blur-md';
      case 'ghost':
        return 'bg-transparent hover:bg-slate-100 text-slate-700 dark:hover:bg-white/5 dark:text-slate-300 border-transparent';
    }
  }
}
