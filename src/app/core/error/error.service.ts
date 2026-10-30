import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ErrorCode,
  ErrorDetail,
  ERROR_DEFINITIONS,
} from '../../features/error/models/error.models';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  private readonly router = inject(Router);

  // Global modal state
  public readonly activeModalError = signal<ErrorDetail | null>(null);
  public readonly isModalOpen = signal<boolean>(false);
  public readonly lastError = signal<ErrorDetail | null>(null);

  /**
   * Displays an interactive liquid-glass modal over the current screen without navigating away.
   */
  public showModal(codeOrDetail: ErrorCode | ErrorDetail, overrides?: Partial<ErrorDetail>): void {
    const detail = typeof codeOrDetail === 'number'
      ? this.buildErrorDetail(codeOrDetail, overrides)
      : { ...codeOrDetail, ...overrides };

    this.activeModalError.set(detail);
    this.lastError.set(detail);
    this.isModalOpen.set(true);
  }

  /**
   * Closes the active error modal.
   */
  public closeModal(): void {
    this.isModalOpen.set(false);
    this.activeModalError.set(null);
  }

  /**
   * Navigates to a dedicated full-page error view (e.g. /error/404, /error/403, /error/500).
   */
  public navigateToError(code: ErrorCode, overrides?: Partial<ErrorDetail>): void {
    const detail = this.buildErrorDetail(code, overrides);
    this.lastError.set(detail);
    this.router.navigate(['/error', code], { state: { error: detail } });
  }

  /**
   * Builds an ErrorDetail combining defaults with custom runtime overrides (like message, details, retryCallback).
   */
  public buildErrorDetail(code: ErrorCode, overrides?: Partial<ErrorDetail>): ErrorDetail {
    const base = ERROR_DEFINITIONS[code] || ERROR_DEFINITIONS[500];
    const correlationId = overrides?.correlationId || 'ERR-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    return {
      ...base,
      correlationId,
      ...overrides,
    };
  }

  /**
   * Copies technical error details and correlation ID to the clipboard.
   */
  public copyTechnicalDetails(detail: ErrorDetail): Promise<boolean> {
    const payload = JSON.stringify(
      {
        code: detail.code,
        title: detail.title,
        message: detail.message,
        correlationId: detail.correlationId,
        technicalDetails: detail.technicalDetails,
        timestamp: new Date().toISOString(),
      },
      null,
      2
    );

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      return navigator.clipboard.writeText(payload).then(() => true).catch(() => false);
    }
    return Promise.resolve(false);
  }
}
