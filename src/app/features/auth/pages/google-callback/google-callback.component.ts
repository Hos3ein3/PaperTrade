import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { ToastService } from '../../../../core/notifications/toast.service';
import { ThemeService } from '../../../../core/theme/theme.service';
import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';

@Component({
  selector: 'app-google-callback',
  standalone: true,
  imports: [CommonModule, RouterModule, GlassButtonComponent],
  templateUrl: './google-callback.component.html'
})
export class GoogleCallbackComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  public readonly theme = inject(ThemeService);

  public readonly isProcessing = signal<boolean>(true);
  public readonly errorMessage = signal<string | null>(null);
  public readonly authStatus = signal<string>('Exchanging tokens with Google...');
  private returnUrl = '/trading';
  private mode = 0; // 0 = SignInOrRegister, 1 = SignInOnly, 2 = RegisterOnly

  public ngOnInit(): void {
    this.processCallback();
  }

  private processCallback(): void {
    // 1. Read hash params (OAuth 2.0 Implicit Flow sends response in hash #...)
    const hash = window.location.hash.startsWith('#')
      ? window.location.hash.substring(1)
      : window.location.hash;
    const hashParams = new URLSearchParams(hash);
    const queryParams = this.route.snapshot.queryParams;

    const idToken = hashParams.get('id_token') || queryParams['id_token'];
    const accessToken = hashParams.get('access_token') || queryParams['access_token'];
    const rawState = hashParams.get('state') || queryParams['state'];
    const error = hashParams.get('error') || queryParams['error'];
    const errorDesc = hashParams.get('error_description') || queryParams['error_description'];

    // 2. Parse state if present
    if (rawState) {
      try {
        const stateObj = JSON.parse(decodeURIComponent(rawState));
        this.returnUrl = stateObj.returnUrl || '/trading';
        if (stateObj.intent === 'register') {
          this.mode = 2;
        } else if (stateObj.intent === 'signin') {
          this.mode = 1;
        }
      } catch {
        this.returnUrl = '/trading';
      }
    }

    // 3. Handle Google OAuth Error if returned
    if (error) {
      this.isProcessing.set(false);
      this.errorMessage.set(errorDesc || `Google OAuth error: ${error}`);
      return;
    }

    // 4. Handle ID Token or Access Token
    if (idToken) {
      this.authStatus.set('Verifying Google credentials with backend...');
      const claims = this.decodeJwtPayload(idToken);
      const email = claims?.email || '';
      const name = claims?.name || claims?.given_name || 'Google Trader';
      const providerKey = claims?.sub || '';

      if (!email) {
        this.isProcessing.set(false);
        this.errorMessage.set('Google ID token did not contain a valid email address.');
        return;
      }

      this.executeBackendAuth(email, name, providerKey, idToken);
      return;
    }

    // If query params or hash didn't contain an id_token (e.g. direct visit or client ID pending setup)
    this.isProcessing.set(false);
    this.errorMessage.set(
      'No authorization tokens were detected in the Google callback response. You can retry signing in or use demo Google authentication below.'
    );
  }

  public completeWithDemoGoogle(): void {
    this.isProcessing.set(true);
    this.errorMessage.set(null);
    this.authStatus.set('Authenticating with demo Google account...');
    this.executeBackendAuth('trader.demo@gmail.com', 'Google Trader', 'google-oauth-demo-key');
  }

  private executeBackendAuth(email: string, name: string, providerKey: string, idToken?: string): void {
    this.auth.googleAuth({
      email,
      name,
      providerKey,
      idToken,
      mode: this.mode
    }).subscribe({
      next: (res) => {
        this.isProcessing.set(false);
        if (res.succeeded) {
          this.toast.success('Google Authentication', 'Signed in successfully via Google.');
          this.router.navigateByUrl(this.returnUrl);
        } else {
          this.errorMessage.set(res.message || 'Google authentication was not accepted by the server.');
        }
      },
      error: (err) => {
        this.isProcessing.set(false);
        this.errorMessage.set(
          err?.error?.detail || err?.error?.title || err?.message || 'Server error during Google authentication.'
        );
      }
    });
  }

  private decodeJwtPayload(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }
}
