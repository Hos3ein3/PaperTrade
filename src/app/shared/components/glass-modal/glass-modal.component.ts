import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-glass-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './glass-modal.component.html'
})
export class GlassModalComponent {
  public readonly isOpen = input<boolean>(false);
  public readonly title = input<string>('');
  public readonly subtitle = input<string>('');
  public readonly icon = input<string>('');
  public readonly maxWidth = input<'sm' | 'md' | 'lg' | 'xl' | '2xl'>('md');
  public readonly closeOnBackdrop = input<boolean>(true);

  public readonly closed = output<void>();

  protected maxWidthClass(): string {
    switch (this.maxWidth()) {
      case 'sm': return 'max-w-sm';
      case 'lg': return 'max-w-xl';
      case 'xl': return 'max-w-2xl';
      case '2xl': return 'max-w-4xl';
      case 'md':
      default: return 'max-w-lg';
    }
  }
}
