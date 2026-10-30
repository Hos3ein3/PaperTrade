import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'bullish' | 'bearish' | 'warning' | 'info' | 'neutral' | 'purple';

@Component({
  selector: 'app-glass-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './glass-badge.component.html'
})
export class GlassBadgeComponent {
  public readonly variant = input<BadgeVariant>('neutral');
  public readonly dot = input<boolean>(false);

  protected variantClasses(): string {
    switch (this.variant()) {
      case 'bullish':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]';
      case 'bearish':
        return 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.15)]';
      case 'warning':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]';
      case 'info':
        return 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]';
      case 'purple':
        return 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.15)]';
      case 'neutral':
      default:
        return 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-400/30';
    }
  }

  protected dotClasses(): string {
    switch (this.variant()) {
      case 'bullish': return 'bg-emerald-500';
      case 'bearish': return 'bg-rose-500';
      case 'warning': return 'bg-amber-500';
      case 'info': return 'bg-cyan-500';
      case 'purple': return 'bg-purple-500';
      case 'neutral':
      default: return 'bg-slate-400';
    }
  }
}
