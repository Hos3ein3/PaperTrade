import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ErrorService } from '../../../core/error/error.service';
import { ToastService } from '../../../core/notifications/toast.service';
import { GlassButtonComponent } from '../glass-button/glass-button.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [CommonModule, GlassButtonComponent],
  templateUrl: './error-modal.component.html',
})
export class ErrorModalComponent {
  public readonly errorService = inject(ErrorService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  public readonly showTechnicalDetails = signal<boolean>(false);
  public readonly showErrorTraces = environment.features.showErrorTraces !== false;

  @HostListener('document:keydown.escape')
  public onEscape(): void {
    if (this.errorService.isModalOpen()) {
      this.close();
    }
  }

  public close(): void {
    this.errorService.closeModal();
    this.showTechnicalDetails.set(false);
  }

  public toggleDetails(): void {
    this.showTechnicalDetails.update((v) => !v);
  }

  public executePrimary(): void {
    const err = this.errorService.activeModalError();
    if (!err) return;

    if (err.primaryAction?.action) {
      err.primaryAction.action();
      this.close();
    } else if (err.retryCallback) {
      err.retryCallback();
      this.close();
    } else if (err.primaryAction?.link) {
      this.router.navigateByUrl(err.primaryAction.link);
      this.close();
    } else {
      this.close();
    }
  }

  public executeSecondary(): void {
    const err = this.errorService.activeModalError();
    if (!err) return;

    if (err.secondaryAction?.action) {
      err.secondaryAction.action();
      this.close();
    } else if (err.secondaryAction?.link) {
      this.router.navigateByUrl(err.secondaryAction.link);
      this.close();
    } else {
      this.close();
    }
  }

  public openFullPage(): void {
    const err = this.errorService.activeModalError();
    if (err) {
      this.errorService.navigateToError(err.code, err);
      this.close();
    }
  }

  public copyDiagnostics(): void {
    const err = this.errorService.activeModalError();
    if (!err) return;

    this.errorService.copyTechnicalDetails(err).then((ok) => {
      if (ok) {
        this.toast.success('Copied', 'Error diagnostics copied to clipboard.');
      }
    });
  }

  public formatDetails(details: any): string {
    if (!details) return '';
    if (typeof details === 'string') return details;
    try {
      return JSON.stringify(details, null, 2);
    } catch {
      return String(details);
    }
  }
}
