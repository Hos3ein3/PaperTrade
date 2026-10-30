import { describe, it, expect } from 'vitest';
import { UrlBuilder } from './url-builder';
import { ApiEndpoints } from './api-endpoints';

describe('UrlBuilder', () => {
  it('should build basic url with base and path', () => {
    const url = UrlBuilder.create('https://api.trackerpro.com/api/v1')
      .path(ApiEndpoints.Trading.Dashboard)
      .build();
    expect(url).toBe('https://api.trackerpro.com/api/v1/trading/dashboard');
  });

  it('should replace typed path parameters properly', () => {
    const alertId = 'a1b2c3d4-e5f6-7890-1234-56789abcdef0';
    const url = UrlBuilder.create('https://api.trackerpro.com/api/v1')
      .path(ApiEndpoints.Crypto.DeleteAlert)
      .param('alertId', alertId)
      .build();
    expect(url).toBe(`https://api.trackerpro.com/api/v1/crypto/alerts/${alertId}`);
  });

  it('should format query strings correctly and ignore null/empty', () => {
    const url = UrlBuilder.create('https://api.trackerpro.com/api/v1')
      .path(ApiEndpoints.Trading.Quotes)
      .query('search', 'BTC')
      .query('assetClass', 1)
      .query('emptyParam', null)
      .build();
    expect(url).toBe('https://api.trackerpro.com/api/v1/trading/quotes?search=BTC&assetClass=1');
  });

  it('should build relative url without origin base', () => {
    const url = UrlBuilder.create('https://api.trackerpro.com/api/v1')
      .path(ApiEndpoints.Auth.Login)
      .buildRelative();
    expect(url).toBe('/auth/login');
  });
});
