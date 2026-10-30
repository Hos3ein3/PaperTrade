import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../core/interceptors/loading.interceptor';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-overlay.component.html',
})
export class LoadingOverlayComponent {
  public readonly loadingService = inject(LoadingService);

  public onCancel(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.loadingService.cancelAll();
  }
}
