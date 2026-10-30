import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-glass-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './glass-card.component.html'
})
export class GlassCardComponent {
  public readonly title = input<string>('');
  public readonly subtitle = input<string>('');
  public readonly icon = input<string>('');
  public readonly padding = input<'sm' | 'md' | 'lg' | 'none'>('md');
  public readonly interactive = input<boolean>(false);
  public readonly customClass = input<string>('');

  protected paddingClass(): string {
    switch (this.padding()) {
      case 'none': return 'p-0';
      case 'sm': return 'p-3';
      case 'lg': return 'p-6';
      default: return 'p-4';
    }
  }
}
