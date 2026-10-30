import { AfterViewInit, Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../core/auth/auth.service';
import { ThemeService } from '../../../../core/theme/theme.service';
import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';
import { GlassCheckboxComponent } from '../../../../shared/components/glass-checkbox/glass-checkbox.component';
import { ToastService } from '../../../../core/notifications/toast.service';
import { environment } from '../../../../../environments/environment';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, GlassButtonComponent, GlassCheckboxComponent],
  templateUrl: './login.component.html'
})
export class LoginComponent implements AfterViewInit {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  public readonly theme = inject(ThemeService);

  @ViewChild('btn') btn!: ElementRef;

  public email = 'trader@trackerpro.io';
  public password = 'Password123!';
  public rememberMe = true;
  public readonly showPassword = signal<boolean>(false);
  public readonly isLoading = signal<boolean>(false);
  public readonly isGoogleBtnLoaded = signal<boolean>(false);

  ngAfterViewInit(): void {
    this.initGoogleBtn();
  }

  private initGoogleBtn(): void {
    const tryInit = () => {
      if (typeof google !== 'undefined' && google?.accounts?.id && this.btn?.nativeElement) {
        try {
          google.accounts.id.initialize({
            client_id: environment.googleClientId,
            callback: (res: any) => this.onGoogle(res.credential),
          });
          google.accounts.id.renderButton(this.btn.nativeElement, {
            theme: this.theme.isDark() ? 'filled_black' : 'outline',
            size: 'large',
            shape: 'rectangular',
            width: 340,
            text: 'continue_with'
          });
          this.isGoogleBtnLoaded.set(true);
        } catch (e) {
          console.warn('Google GSI initialization error:', e);
        }
      }
    };

    tryInit();
    if (!this.isGoogleBtnLoaded()) {
      setTimeout(tryInit, 400);
      setTimeout(tryInit, 1200);
    }
  }

  public onGoogle(idToken: string): void {
    if (!idToken) return;
    this.isLoading.set(true);
    const targetUrl = `${environment.apiUrl || environment.apiBaseUrl}/auth/google`;

    this.http
      .post<{ token: string; refreshToken?: string; message?: string }>(targetUrl, { idToken })
      .subscribe({
        next: (r) => {
          this.isLoading.set(false);
          localStorage.setItem('access_token', r.token);
          this.auth.handleAuthSuccess(r.token, r.refreshToken, {
            email: 'google-user@trackerpro.io',
            name: 'Google User',
          });
          this.toast.success('Welcome Back', 'Signed in with Google.');
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/trading';
          this.router.navigateByUrl(returnUrl);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.toast.error('Google Sign In Failed', err?.error?.detail || err?.message || 'Could not verify Google token.');
        }
      });
  }

  public onSubmit(): void {
    if (!this.email || !this.password) return;

    this.isLoading.set(true);
    this.auth.login({ email: this.email, password: this.password, rememberMe: this.rememberMe }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.succeeded) {
          this.toast.success('Welcome Back', 'Signed in to trading terminal.');
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/trading';
          this.router.navigateByUrl(returnUrl);
        } else {
          this.toast.error('Sign In Failed', res.message || 'Invalid credentials.');
        }
      },
      error: () => this.isLoading.set(false),
    });
  }

  public loginWithGoogle(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/trading';
    this.auth.redirectToGoogle('signin', returnUrl);
  }
}
