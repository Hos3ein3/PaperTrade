import { TestBed } from '@angular/core/testing';
import { UserPreferencesStorageService } from './user-preferences-storage.service';
import { PreferredTimeZone } from '../time/time-zone.models';
import { UserPreferences } from '../../features/profile/models/profile.models';

describe('UserPreferencesStorageService', () => {
  let service: UserPreferencesStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserPreferencesStorageService);
    service.clear();
  });

  afterEach(() => {
    service.clear();
  });

  it('should return default preferences when nothing stored', () => {
    const pref = service.load();
    expect(pref).toBeDefined();
    expect(pref.currency).toBe('USD');
    expect(pref.timeZone).toBe(PreferredTimeZone.Utc);
    expect(pref.isDarkMode).toBe(true);
  });

  it('should save and load preferences to and from LocalStorage and Cookie', () => {
    const custom: UserPreferences = {
      language: 'fr',
      themeColor: 'violet',
      currency: 'EUR',
      preferredDashboard: 'terminal',
      isDarkMode: false,
      timeZone: PreferredTimeZone.CentralEuropean,
    };

    service.save(custom);
    const loaded = service.load();

    expect(loaded.language).toBe('fr');
    expect(loaded.themeColor).toBe('violet');
    expect(loaded.currency).toBe('EUR');
    expect(loaded.preferredDashboard).toBe('terminal');
    expect(loaded.isDarkMode).toBe(false);
    expect(loaded.timeZone).toBe(PreferredTimeZone.CentralEuropean);
  });

  it('should clear stored preferences', () => {
    service.save({
      language: 'de',
      themeColor: 'amber',
      currency: 'GBP',
      preferredDashboard: 'crypto',
      isDarkMode: true,
      timeZone: PreferredTimeZone.London,
    });

    service.clear();
    const loaded = service.load();
    expect(loaded.currency).toBe('USD');
    expect(loaded.timeZone).toBe(PreferredTimeZone.Utc);
  });
});
