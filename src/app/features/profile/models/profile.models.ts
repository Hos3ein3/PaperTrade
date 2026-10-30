import { PreferredTimeZone } from '../../../core/time/time-zone.models';

export interface UserProfile {
  id: string;
  userName?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profileImage?: string;
}

export interface UserPreferences {
  userId?: string;
  language: string;
  themeColor: string;
  currency: string;
  preferredDashboard: string;
  isDarkMode: boolean;
  timeZone: PreferredTimeZone;
}
