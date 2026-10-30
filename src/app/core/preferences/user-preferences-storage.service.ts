import { Injectable } from '@angular/core';
import { UserPreferences } from '../../features/profile/models/profile.models';
import { PreferredTimeZone } from '../time/time-zone.models';

@Injectable({
  providedIn: 'root',
})
export class UserPreferencesStorageService {
  private readonly LOCAL_STORAGE_KEY = 'tp_user_preferences';
  private readonly COOKIE_NAME = 'tp_user_pref';

  public readonly defaultPreferences: UserPreferences = {
    language: 'en',
    themeColor: 'teal',
    currency: 'USD',
    preferredDashboard: 'trading',
    isDarkMode: true,
    timeZone: PreferredTimeZone.Utc,
  };

  /**
   * Loads preferences from LocalStorage, falling back to Cookie, and finally defaults.
   */
  public load(): UserPreferences {
    // 1. Try LocalStorage
    try {
      const fromLocal = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (fromLocal) {
        const parsed = JSON.parse(fromLocal);
        return this.sanitize(parsed);
      }
    } catch {
      // LocalStorage access restricted or unavailable
    }

    // 2. Try Cookie fallback
    const fromCookie = this.getCookie(this.COOKIE_NAME);
    if (fromCookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(fromCookie));
        const sanitized = this.sanitize(parsed);
        // Sync to LocalStorage if possible
        try {
          localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(sanitized));
        } catch {
          // ignore
        }
        return sanitized;
      } catch {
        // ignore cookie parse error
      }
    }

    return { ...this.defaultPreferences };
  }

  /**
   * Saves preferences simultaneously into LocalStorage and a persistent Cookie (1 year).
   */
  public save(pref: UserPreferences): void {
    const sanitized = this.sanitize(pref);
    const json = JSON.stringify(sanitized);

    // Save to LocalStorage
    try {
      localStorage.setItem(this.LOCAL_STORAGE_KEY, json);
    } catch (e) {
      console.warn('LocalStorage save failed for user preferences:', e);
    }

    // Save to Cookie (1 year expiry)
    try {
      this.setCookie(this.COOKIE_NAME, encodeURIComponent(json), 365);
    } catch (e) {
      console.warn('Cookie save failed for user preferences:', e);
    }
  }

  /**
   * Clears preferences from both LocalStorage and Cookie.
   */
  public clear(): void {
    try {
      localStorage.removeItem(this.LOCAL_STORAGE_KEY);
    } catch {
      // ignore
    }
    this.deleteCookie(this.COOKIE_NAME);
  }

  private sanitize(input: any): UserPreferences {
    return {
      userId: input?.userId,
      language: input?.language || this.defaultPreferences.language,
      themeColor: input?.themeColor || this.defaultPreferences.themeColor,
      currency: input?.currency || this.defaultPreferences.currency,
      preferredDashboard: input?.preferredDashboard || this.defaultPreferences.preferredDashboard,
      isDarkMode: typeof input?.isDarkMode === 'boolean' ? input.isDarkMode : this.defaultPreferences.isDarkMode,
      timeZone: typeof input?.timeZone === 'number' ? (input.timeZone as PreferredTimeZone) : (PreferredTimeZone[input?.timeZone as keyof typeof PreferredTimeZone] ?? PreferredTimeZone.Utc),
    };
  }

  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
    return match ? match[3] : null;
  }

  private setCookie(name: string, value: string, days: number): void {
    if (typeof document === 'undefined') return;
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }

  private deleteCookie(name: string): void {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
  }
}
