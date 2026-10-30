import { Injectable, inject, signal } from '@angular/core';
import { UserPreferencesStorageService } from './user-preferences-storage.service';
import { ProfileApiService } from '../../features/profile/services/profile-api.service';
import { ThemeService, AccentColor } from '../theme/theme.service';
import { TimeProvider } from '../time/time-provider';
import { PreferredTimeZone } from '../time/time-zone.models';
import { UserPreferences } from '../../features/profile/models/profile.models';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserPreferencesService {
  private readonly storage = inject(UserPreferencesStorageService);
  private readonly api = inject(ProfileApiService);
  private readonly theme = inject(ThemeService);
  private readonly timeProvider = inject(TimeProvider);

  // Reactive state loaded immediately from LocalStorage / Cookie
  public readonly preferences = signal<UserPreferences>(this.storage.load());

  constructor() {
    // Apply initial settings right away
    this.applySettings(this.preferences());
  }

  /**
   * Refreshes user preferences from the backend API, syncing local storage/cookies.
   */
  public syncFromApi(): Observable<UserPreferences> {
    return this.api.getPreferences().pipe(
      tap((apiPref) => {
        if (apiPref) {
          const updated = {
            ...this.preferences(),
            ...apiPref,
            timeZone: typeof apiPref.timeZone === 'number'
              ? apiPref.timeZone
              : (PreferredTimeZone[apiPref.timeZone as keyof typeof PreferredTimeZone] ?? PreferredTimeZone.Utc),
          };
          this.setPreferences(updated);
        }
      })
    );
  }

  /**
   * Updates user preferences in reactive state, local storage, cookie, and the backend API.
   */
  public updatePreferences(partial: Partial<UserPreferences>): Observable<any> {
    const current = this.preferences();
    const updated: UserPreferences = {
      ...current,
      ...partial,
    };

    // 1. Immediately apply to state, theme, time provider, local storage, and cookie
    this.setPreferences(updated);

    // 2. Dispatch to backend API
    return this.api.updatePreferences(updated);
  }

  /**
   * Updates local state and caches in storage without calling the API.
   */
  public setPreferences(pref: UserPreferences): void {
    this.preferences.set(pref);
    this.storage.save(pref);
    this.applySettings(pref);
  }

  /**
   * Sets the preferred timezone and synchronizes with storage and TimeProvider.
   */
  public setTimeZone(timeZone: PreferredTimeZone): void {
    this.updatePreferences({ timeZone }).subscribe();
  }

  private applySettings(pref: UserPreferences): void {
    // Apply Dark/Light theme mode
    if (pref.isDarkMode !== this.theme.isDark()) {
      if (pref.isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    // Apply accent color palette
    if (pref.themeColor) {
      this.theme.setAccent(pref.themeColor as AccentColor);
    }

    // Apply timezone to TimeProvider
    if (pref.timeZone !== undefined) {
      this.timeProvider.setPreferredTimeZone(pref.timeZone);
    }
  }
}
