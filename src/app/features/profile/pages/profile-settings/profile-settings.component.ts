import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileApiService } from '../../services/profile-api.service';
import { ThemeService, AccentColor } from '../../../../core/theme/theme.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ToastService } from '../../../../core/notifications/toast.service';
import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';
import { UserProfile, UserPreferences } from '../../models/profile.models';
import { UserPreferencesService } from '../../../../core/preferences/user-preferences.service';
import { TimeProvider } from '../../../../core/time/time-provider';
import {
  PreferredTimeZone,
  TimeZoneDefinition,
  getTimeZoneDefinition,
} from '../../../../core/time/time-zone.models';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, GlassButtonComponent],
  templateUrl: './profile-settings.component.html'
})
export class ProfileSettingsComponent implements OnInit {
  private readonly api = inject(ProfileApiService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  public readonly theme = inject(ThemeService);
  public readonly prefService = inject(UserPreferencesService);
  public readonly timeProvider = inject(TimeProvider);

  public readonly activeTab = signal<'profile' | 'preferences' | 'security'>('profile');

  public profile: UserProfile = {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  };

  public preferences: UserPreferences = {
    language: 'en',
    themeColor: 'teal',
    currency: 'USD',
    preferredDashboard: 'trading',
    isDarkMode: true,
    timeZone: PreferredTimeZone.Utc,
  };

  public readonly availableTimeZones: TimeZoneDefinition[] = this.timeProvider.getAvailableTimeZones();

  public currentPassword = '';
  public newPassword = '';
  public confirmNewPassword = '';

  public readonly accents: { id: AccentColor; label: string; colorClass: string }[] = [
    { id: 'teal', label: 'Teal', colorClass: 'bg-teal-400' },
    { id: 'emerald', label: 'Emerald', colorClass: 'bg-emerald-400' },
    { id: 'violet', label: 'Violet', colorClass: 'bg-violet-400' },
    { id: 'amber', label: 'Amber', colorClass: 'bg-amber-400' },
    { id: 'slate', label: 'Slate', colorClass: 'bg-slate-400' },
  ];

  ngOnInit(): void {
    // 1. Initialize from local storage / cookie immediately
    this.preferences = { ...this.prefService.preferences() };

    // 2. Populate profile info from active user session
    const user = this.auth.currentUser();
    if (user) {
      const parts = (user.name || '').split(' ');
      this.profile.firstName = parts[0] || '';
      this.profile.lastName = parts.slice(1).join(' ') || '';
      this.profile.email = user.email || '';
    }

    // 3. Fetch fresh profile from backend
    this.api.getProfile().subscribe({
      next: (res) => {
        if (res) {
          this.profile = { ...this.profile, ...res };
        }
      },
    });

    // 4. Synchronize preferences with backend API
    this.prefService.syncFromApi().subscribe({
      next: (res) => {
        if (res) {
          this.preferences = { ...this.preferences, ...res };
        }
      },
    });
  }

  public saveProfile(): void {
    this.api.updateProfile(this.profile).subscribe({
      next: () => this.toast.success('Updated', 'Personal profile saved.'),
      error: (err) => this.toast.error('Profile Error', err?.message || 'Could not update profile.'),
    });
  }

  public toggleTheme(): void {
    this.theme.toggleDarkMode();
    this.preferences.isDarkMode = this.theme.isDark();
    this.savePreferences();
  }

  public selectAccent(acc: AccentColor): void {
    this.theme.setAccent(acc);
    this.preferences.themeColor = acc;
    this.savePreferences();
  }

  public onTimeZoneChange(newTz: any): void {
    this.preferences.timeZone = Number(newTz);
    this.timeProvider.setPreferredTimeZone(this.preferences.timeZone);
  }

  public getTimeZonePreview(): string {
    return this.timeProvider.format(new Date(), 'full', this.preferences.timeZone);
  }

  public getSelectedTzDefinition(): TimeZoneDefinition {
    return getTimeZoneDefinition(this.preferences.timeZone);
  }

  public savePreferences(): void {
    this.prefService.updatePreferences(this.preferences).subscribe({
      next: () => this.toast.success('Preferences', 'Workstation settings saved to local storage, cookies, and server.'),
      error: (err) => this.toast.error('Preferences Error', err?.message || 'Could not persist preferences.'),
    });
  }

  public changePassword(): void {
    if (this.newPassword !== this.confirmNewPassword) {
      this.toast.error('Mismatch', 'New passwords do not match.');
      return;
    }
    this.auth.changePassword({ currentPassword: this.currentPassword, newPassword: this.newPassword, confirmPassword: this.confirmNewPassword }).subscribe({
      next: () => {
        this.toast.success('Security', 'Password updated successfully.');
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmNewPassword = '';
      },
      error: (err) => this.toast.error('Password Error', err?.message || 'Password update failed.'),
    });
  }

  public logout(): void {
    this.auth.logout();
  }
}
