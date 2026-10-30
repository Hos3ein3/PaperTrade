import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ErrorCode, ErrorDetail, ERROR_DEFINITIONS } from '../../models/error.models';
import { ErrorService } from '../../../../core/error/error.service';
import { ThemeService } from '../../../../core/theme/theme.service';
import { ToastService } from '../../../../core/notifications/toast.service';
import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [CommonModule, RouterModule, GlassButtonComponent],
  templateUrl: './error-page.component.html',
})
export class ErrorPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly errorService = inject(ErrorService);
  private readonly toast = inject(ToastService);
  public readonly theme = inject(ThemeService);

  public readonly error = signal<ErrorDetail>(this.errorService.buildErrorDetail(404));
  public readonly showTechnicalDetails = signal<boolean>(false);
  public readonly showErrorTraces = environment.features.showErrorTraces !== false;

  ngOnInit(): void {
    // 1. Check navigation history state
    const navState = history.state?.error as ErrorDetail | undefined;
    if (navState && navState.code) {
      this.error.set(navState);
      return;
    }

    // 2. Check route data (e.g. data: { code: 404 })
    const dataCode = this.route.snapshot.data['code'] as ErrorCode | undefined;
    if (dataCode !== undefined) {
      this.error.set(this.errorService.buildErrorDetail(dataCode));
      return;
    }

    // 3. Check route params :code or path segments
    const paramCode = this.route.snapshot.params['code'];
    const path = this.route.snapshot.routeConfig?.path || '';

    let code: ErrorCode = 404;
    if (paramCode) {
      const parsed = parseInt(paramCode, 10) as ErrorCode;
      if (parsed in ERROR_DEFINITIONS) {
        code = parsed;
      }
    } else if (path.includes('forbidden')) {
      code = 403;
    } else if (path.includes('unauthorized')) {
      code = 401;
    } else if (path.includes('not-allowed')) {
      code = 405;
    } else if (path.includes('server-error')) {
      code = 500;
    } else if (path.includes('service-unavailable')) {
      code = 503;
    }

    this.error.set(this.errorService.buildErrorDetail(code));
  }

  public goBack(): void {
    this.location.back();
  }

  public executePrimary(): void {
    const err = this.error();
    if (err.primaryAction?.action) {
      err.primaryAction.action();
    } else if (err.retryCallback) {
      err.retryCallback();
    } else if (err.primaryAction?.link) {
      this.router.navigateByUrl(err.primaryAction.link);
    } else {
      this.router.navigate(['/trading']);
    }
  }

  public copyDiagnostics(): void {
    this.errorService.copyTechnicalDetails(this.error()).then((ok) => {
      if (ok) {
        this.toast.success('Copied', 'Technical diagnostic payload copied to clipboard.');
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
