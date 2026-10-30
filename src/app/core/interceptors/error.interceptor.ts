import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../notifications/toast.service';
import { ErrorService } from '../error/error.service';
import { ErrorCode } from '../../features/error/models/error.models';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);
  const errorService = inject(ErrorService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 1. Silent or background poll requests bypass global modals
      const isSilent =
        req.headers.has('X-Silent') ||
        req.headers.get('X-Error-Mode') === 'silent' ||
        (req.url.includes('trading/live-status') && error.status === 0);

      if (isSilent) {
        return throwError(() => error);
      }

      const errorMode = req.headers.get('X-Error-Mode') || 'modal';
      const detail =
        error.error?.detail ||
        error.error?.title ||
        error.error?.message ||
        error.message ||
        'An unexpected operational error occurred.';

      const correlationId =
        error.headers.get('X-Correlation-ID') ||
        error.error?.traceId ||
        error.error?.instance ||
        undefined;

      const code = (error.status in [400, 401, 403, 404, 405, 500, 502, 503]
        ? error.status
        : error.status === 0
        ? 0
        : 500) as ErrorCode;

      // Handle based on HTTP Status Code
      switch (error.status) {
        case 401: {
          const isAuthEndpoint = req.url.includes('auth/login') || req.url.includes('auth/refresh-token');
          if (!isAuthEndpoint) {
            auth.clearSession();
            if (errorMode === 'page') {
              router.navigate(['/error/unauthorized']);
            } else {
              errorService.showModal(401, {
                message: 'Your trading session has expired. Please re-authenticate to continue.',
                technicalDetails: error.error,
                correlationId,
                primaryAction: {
                  label: 'Sign In Again',
                  icon: 'fa-solid fa-right-to-bracket',
                  action: () => {
                    router.navigate(['/auth/login'], { queryParams: { returnUrl: router.url } });
                  },
                },
              });
            }
          }
          break;
        }

        case 403: {
          if (errorMode === 'page') {
            router.navigate(['/error/forbidden']);
          } else {
            errorService.showModal(403, {
              message: detail || 'You do not have administrative or tier clearance to execute this operation.',
              technicalDetails: error.error,
              correlationId,
            });
          }
          break;
        }

        case 404: {
          if (errorMode === 'page') {
            router.navigate(['/error/not-found']);
          } else {
            toast.warning('Resource Not Found', detail || 'The requested asset, order, or route was not found.');
          }
          break;
        }

        case 405: {
          errorService.showModal(405, {
            message: detail || 'Method Not Allowed: This action is prohibited on the target asset or endpoint.',
            technicalDetails: error.error,
            correlationId,
          });
          break;
        }

        case 400: {
          toast.error('Validation Error', detail);
          break;
        }

        case 500:
        case 502: {
          if (errorMode === 'page') {
            router.navigate(['/error/server-error']);
          } else {
            errorService.showModal(500, {
              message: detail || 'The backend API service encountered an unexpected error processing your request.',
              technicalDetails: error.error || error.message,
              correlationId,
              canRetry: true,
            });
          }
          break;
        }

        case 503:
        case 0: {
          errorService.showModal(error.status === 503 ? 503 : 0, {
            message: 'Unable to communicate with the market API gateway. Please check that the backend server is reachable.',
            technicalDetails: error.message,
            correlationId,
          });
          break;
        }

        default: {
          toast.error(`Error (${error.status})`, detail);
          break;
        }
      }

      return throwError(() => error);
    })
  );
};
