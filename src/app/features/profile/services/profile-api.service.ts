import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { Url } from '../../../core/url-builder/url';
import { environment } from '../../../../environments/environment';
import { UserProfile, UserPreferences } from '../models/profile.models';
import { PreferredTimeZone } from '../../../core/time/time-zone.models';

@Injectable({
  providedIn: 'root',
})
export class ProfileApiService {
  private readonly http = inject(HttpClient);

  public getProfile(): Observable<UserProfile> {
    const url = Url.build(Url.Profile.Get);
    return this.http.get<any>(url).pipe(
      map((res) => (res?.profile ? res.profile : res)),
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          return of({
            id: 'usr-001',
            userName: 'pro_trader',
            email: 'trader@trackerpro.io',
            firstName: 'Demo',
            lastName: 'Trader',
            phoneNumber: '+1 (555) 382-9102',
            profileImage: '',
          });
        }
        return throwError(() => err);
      })
    );
  }

  public updateProfile(profile: Partial<UserProfile>): Observable<any> {
    const url = Url.build(Url.Profile.Update);
    return this.http.post(url, profile).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          return of({ success: true, message: 'Profile updated.' });
        }
        return throwError(() => err);
      })
    );
  }

  public getPreferences(): Observable<UserPreferences> {
    const url = Url.build(Url.UserPreference.Get);
    return this.http.get<UserPreferences>(url).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          return of({
            language: 'en',
            themeColor: 'teal',
            currency: 'USD',
            preferredDashboard: 'trading',
            isDarkMode: true,
            timeZone: PreferredTimeZone.Utc,
          });
        }
        return throwError(() => err);
      })
    );
  }

  public updatePreferences(pref: Partial<UserPreferences>): Observable<any> {
    const url = Url.build(Url.UserPreference.Update);
    return this.http.post(url, pref).pipe(
      catchError((err) => {
        if (environment.features.enableMockFallback) {
          return of({ success: true, ...pref });
        }
        return throwError(() => err);
      })
    );
  }
}
