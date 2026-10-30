import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenStorageService {
  private readonly TOKEN_KEY = 'tp_auth_token';
  private readonly REFRESH_TOKEN_KEY = 'tp_refresh_token';
  private readonly USER_KEY = 'tp_auth_user';

  public getToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }

  public getRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  public setTokens(token: string, refreshToken?: string | null): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
      if (refreshToken) {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
      }
    } catch (e) {
      console.error('Failed to store auth tokens:', e);
    }
  }

  public getUser<T>(): T | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public setUser<T>(user: T): void {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to store user profile:', e);
    }
  }

  public clear(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    } catch (e) {
      console.error('Failed to clear tokens:', e);
    }
  }
}
