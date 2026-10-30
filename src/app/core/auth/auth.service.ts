import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, throwError, map } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import { Url } from '../url-builder/url';
import { environment } from '../../../environments/environment';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role?: string;
  avatarUrl?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  succeeded: boolean;
  isLockedOut: boolean;
  token?: string;
  refreshToken?: string;
  redirectUrl?: string;
  message?: string;
  lockoutEnd?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordRequest {
  userId: string;
  code: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);

  // Reactive Signals
  public readonly currentUser = signal<UserSession | null>(this.tokenStorage.getUser<UserSession>());
  public readonly token = signal<string | null>(this.tokenStorage.getToken());
  public readonly isAuthenticated = computed(() => !!this.token());

  constructor() {
    // If a token is stored, decode user identity from JWT claims
    const existingToken = this.token();
    if (existingToken && (!this.currentUser() || this.currentUser()?.id === 'usr-current')) {
      const user = this.resolveUserSession(existingToken);
      this.tokenStorage.setUser(user);
      this.currentUser.set(user);
    }
  }

  public login(credentials: LoginRequest): Observable<LoginResponse> {
    const url = Url.build(Url.Auth.Login);
    return this.http.post<LoginResponse>(url, credentials).pipe(
      tap((res) => {
        if (res.succeeded && res.token) {
          this.handleAuthSuccess(res.token, res.refreshToken, {
            email: credentials.email,
            name: credentials.email.split('@')[0],
          });
        }
      }),
      catchError((err) => {
        if (environment.features.enableMockFallback && credentials.email.includes('@')) {
          // Mock login for offline demonstration
          const mockToken = 'mock_jwt_token_' + Date.now();
          const mockResponse: LoginResponse = {
            succeeded: true,
            isLockedOut: false,
            token: mockToken,
            refreshToken: 'mock_refresh_token',
            message: 'Signed in successfully (Mock Mode)',
          };
          this.handleAuthSuccess(mockToken, 'mock_refresh_token', {
            id: 'mock-user-id',
            email: credentials.email,
            name: credentials.email.split('@')[0],
          });
          return of(mockResponse);
        }
        return throwError(() => err);
      })
    );
  }

  public register(payload: RegisterRequest): Observable<any> {
    const url = Url.build(Url.Auth.Register);
    return this.http.post(url, payload).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          return of({ message: `Registration successful! Confirmation email sent to ${payload.email}.` });
        }
        return throwError(() => err);
      })
    );
  }

  public redirectToGoogle(intent: 'signin' | 'register' = 'signin', returnUrl: string = '/trading'): void {
    const clientId = environment.googleClientId || 'mock-google-client-id.apps.googleusercontent.com';
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const stateObj = { intent, returnUrl };
    const state = encodeURIComponent(JSON.stringify(stateObj));
    const nonce = Math.random().toString(36).substring(2);

    const googleAuthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=id_token%20token&` +
      `scope=${encodeURIComponent('openid email profile')}&` +
      `nonce=${nonce}&` +
      `state=${state}&` +
      `prompt=select_account`;

    window.location.href = googleAuthUrl;
  }

  public googleAuth(request: {
    email: string;
    name?: string;
    idToken?: string;
    providerKey?: string;
    mode?: number;
  }): Observable<LoginResponse> {
    const url = Url.build(Url.Auth.Google);
    return this.http.post<any>(url, request).pipe(
      map((raw: any) => {
        const res = raw?.value ?? raw;
        return res as LoginResponse;
      }),
      tap((res) => {
        if (res.succeeded && res.token) {
          this.handleAuthSuccess(res.token, res.refreshToken, {
            email: request.email,
            name: request.name || request.email.split('@')[0],
          });
        }
      })
    );
  }

  public loginByGoogle(email: string, name?: string, idToken?: string): Observable<LoginResponse> {
    return this.googleAuth({ email, name, idToken, mode: 0 });
  }

  public registerByGoogle(email: string, name?: string, idToken?: string): Observable<LoginResponse> {
    return this.googleAuth({ email, name, idToken, mode: 2 });
  }

  public forgotPassword(email: string): Observable<any> {
    const url = Url.build(Url.Auth.ForgotPassword);
    return this.http.post(url, { email }).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          return of({ message: `Password reset instructions dispatched to ${email}.` });
        }
        return throwError(() => err);
      })
    );
  }

  public resetPassword(payload: ResetPasswordRequest): Observable<any> {
    const url = Url.build(Url.Auth.ResetPassword);
    return this.http.post(url, payload).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          return of({ message: 'Password has been reset successfully.' });
        }
        return throwError(() => err);
      })
    );
  }

  public changePassword(payload: ChangePasswordRequest): Observable<any> {
    const url = Url.build(Url.Auth.ChangePassword);
    return this.http.post(url, payload).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          return of({ message: 'Password changed successfully.' });
        }
        return throwError(() => err);
      })
    );
  }

  public confirmEmail(userId: string, code: string): Observable<any> {
    const url = Url.build(Url.Auth.ConfirmEmail, undefined, { userId, code });
    return this.http.get(url).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          return of({ message: 'Email confirmed successfully.' });
        }
        return throwError(() => err);
      })
    );
  }

  public refreshToken(): Observable<{ token: string; refreshToken?: string }> {
    const currentToken = this.tokenStorage.getToken() ?? '';
    const refreshToken = this.tokenStorage.getRefreshToken() ?? '';
    const url = Url.build(Url.Auth.RefreshToken);

    return this.http.post<{ token: string; refreshToken?: string }>(url, { token: currentToken, refreshToken }).pipe(
      tap((res) => {
        if (res.token) {
          this.tokenStorage.setTokens(res.token, res.refreshToken);
          this.token.set(res.token);
        }
      })
    );
  }

  public logout(): void {
    const url = Url.build(Url.Auth.Logout);
    this.http.post(url, {}).subscribe({
      next: () => this.clearSession(),
      error: () => this.clearSession(),
    });
  }

  public clearSession(): void {
    this.tokenStorage.clear();
    this.token.set(null);
    this.currentUser.set(null);
  }

  public handleAuthSuccess(token: string, refreshToken?: string, fallbackUser?: Partial<UserSession>): void {
    this.tokenStorage.setTokens(token, refreshToken);
    this.token.set(token);
    const user = this.resolveUserSession(token, fallbackUser);
    this.tokenStorage.setUser(user);
    this.currentUser.set(user);
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

  private resolveUserSession(token: string, fallbackUser?: Partial<UserSession>): UserSession {
    const claims = this.decodeJwtPayload(token);
    const id = claims?.sub || claims?.nameid || claims?.id || fallbackUser?.id || 'usr-current';
    const email = claims?.email || fallbackUser?.email || 'trader@trackerpro.io';
    const firstName = claims?.FirstName || '';
    const lastName = claims?.LastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    const name = fullName || claims?.name || fallbackUser?.name || email.split('@')[0];
    const role =
      claims?.role ||
      claims?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      fallbackUser?.role ||
      'Trader';
    const avatarUrl = claims?.ProfileImage || fallbackUser?.avatarUrl;

    return { id, email, name, role, avatarUrl };
  }
}
