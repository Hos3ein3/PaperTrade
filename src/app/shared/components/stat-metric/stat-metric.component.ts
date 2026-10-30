import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-metric',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-metric.component.html'
})
export class StatMetricComponent {
  public readonly label = input.required<string>();
  public readonly value = input.required<string | number>();
  public readonly unit = input<string>('');
  public readonly icon = input<string>('');
  public readonly subtext = input<string>('');
  public readonly badgeText = input<string>('');
  public readonly trend = input<'up' | 'down' | 'neutral'>('neutral');
  public readonly variant = input<'brand' | 'bullish' | 'bearish' | 'warning' | 'neutral'>('brand');

  protected glowBgClass(): string {
    switch (this.variant()) {
      case 'bullish': return 'bg-emerald-500';
      case 'bearish': return 'bg-rose-500';
      case 'warning': return 'bg-amber-500';
      case 'brand': return 'bg-brand-500';
      default: return 'bg-slate-400';
    }
  }

  protected iconWrapperClass(): string {
    switch (this.variant()) {
      case 'bullish': return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400';
      case 'bearish': return 'bg-rose-500/15 text-rose-700 dark:text-rose-400';
      case 'warning': return 'bg-amber-500/15 text-amber-700 dark:text-amber-400';
      case 'brand': return 'bg-brand-500/15 text-brand-700 dark:text-brand-400';
      default: return 'bg-slate-500/15 text-slate-700 dark:text-slate-400';
    }
  }

  protected badgeClasses(): string {
    if (this.trend() === 'up') {
      return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400';
    } else if (this.trend() === 'down') {
      return 'bg-rose-500/20 text-rose-700 dark:text-rose-400';
    }
    return 'bg-slate-500/20 text-slate-700 dark:text-slate-400';
  }
}
