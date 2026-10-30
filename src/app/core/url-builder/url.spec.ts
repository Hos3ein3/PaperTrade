import { describe, it, expect } from 'vitest';
import { Url } from './url';

describe('Url class based on ApiRoutes.cs', () => {
  it('should expose route constants matching backend ApiRoutes.cs', () => {
    expect(Url.Auth.Login).toBe('auth/login');
    expect(Url.Trading.Dashboard).toBe('trading/dashboard');
    expect(Url.Forex.MarketOverview).toBe('forex/market');
    expect(Url.Crypto.Alerts).toBe('crypto/alerts');
    expect(Url.Notification.UserNotifications).toBe('notifications/user');
    expect(Url.Profile.Get).toBe('profile');
    expect(Url.UserPreference.Get).toBe('user-preference');
  });

  it('should build full URL with path parameters via Url.build', () => {
    const alertId = '12345678-1234-1234-1234-123456789abc';
    const builtUrl = Url.build(Url.Crypto.DeleteAlert, { alertId });
    expect(builtUrl).toContain(`/crypto/alerts/${alertId}`);
  });

  it('should build full URL with query parameters via Url.build', () => {
    const builtUrl = Url.build(Url.Trading.Dashboard, undefined, { symbol: 'ETHUSDT' });
    expect(builtUrl).toContain('/trading/dashboard?symbol=ETHUSDT');
  });

  it('should support fluent chaining via Url.to()', () => {
    const url = Url.to(Url.Forex.CalculateLotSize).build();
    expect(url).toContain('/forex/risk/calculate-lot-size');
  });
});
