import { TimeProvider } from './time-provider';
import { PreferredTimeZone, getTimeZoneDefinition } from './time-zone.models';

describe('TimeProvider (C# System.TimeProvider Equivalent)', () => {
  let provider: TimeProvider;

  beforeEach(() => {
    provider = new TimeProvider();
  });

  it('should expose static System singleton', () => {
    expect(TimeProvider.System).toBeDefined();
    expect(TimeProvider.System.getUtcNow() instanceof Date).toBe(true);
  });

  it('should retrieve UTC time via getUtcNow()', () => {
    const utcNow = provider.getUtcNow();
    expect(utcNow).toBeDefined();
    expect(isNaN(utcNow.getTime())).toBe(false);
  });

  it('should calculate high-resolution timestamps and elapsed time', () => {
    const start = provider.getTimestamp();
    expect(start).toBeGreaterThanOrEqual(0);

    const elapsed = provider.getElapsedTime(start);
    expect(elapsed).toBeGreaterThanOrEqual(0);

    const fixedEnd = start + 250;
    expect(provider.getElapsedTime(start, fixedEnd)).toBe(250);
  });

  it('should switch preferred timezone and return correct IANA identifier', () => {
    provider.setPreferredTimeZone(PreferredTimeZone.CentralEuropean);
    expect(provider.preferredTimeZone).toBe(PreferredTimeZone.CentralEuropean);
    expect(provider.localTimeZone).toBe('Europe/Berlin');

    provider.setPreferredTimeZone(PreferredTimeZone.Tokyo);
    expect(provider.preferredTimeZone).toBe(PreferredTimeZone.Tokyo);
    expect(provider.localTimeZone).toBe('Asia/Tokyo');
  });

  it('should format dates according to specified preferred timezone', () => {
    // 2026-01-15T12:00:00Z:
    // UTC -> 12:00:00
    // CentralEuropean (UTC+1) -> 13:00:00
    // Tokyo (UTC+9) -> 21:00:00
    const fixedUtc = '2026-01-15T12:00:00Z';

    const formattedUtc = provider.format(fixedUtc, 'time', PreferredTimeZone.Utc);
    expect(formattedUtc).toBe('12:00:00');

    const formattedCet = provider.format(fixedUtc, 'time', PreferredTimeZone.CentralEuropean);
    expect(formattedCet).toBe('13:00:00');

    const formattedTokyo = provider.format(fixedUtc, 'time', PreferredTimeZone.Tokyo);
    expect(formattedTokyo).toBe('21:00:00');
  });

  it('should return all 24 time zone definitions matching Domain.PreferredTimeZone', () => {
    const timeZones = provider.getAvailableTimeZones();
    expect(timeZones.length).toBe(24);
    expect(timeZones[0].enumValue).toBe(PreferredTimeZone.Utc);
    expect(timeZones[10].key).toBe('CentralEuropean');
    expect(timeZones[23].key).toBe('Auckland');
  });

  it('should correctly parse string, enum, and numeric timezone representations', () => {
    expect(getTimeZoneDefinition(10).key).toBe('CentralEuropean');
    expect(getTimeZoneDefinition('CentralEuropean').enumValue).toBe(PreferredTimeZone.CentralEuropean);
    expect(getTimeZoneDefinition('Europe/Berlin').key).toBe('CentralEuropean');
    expect(getTimeZoneDefinition(undefined).enumValue).toBe(PreferredTimeZone.Utc);
  });

  it('should create and dispose timers via createTimer()', () => {
    let fired = false;
    const timer = provider.createTimer(() => {
      fired = true;
    }, 100);

    expect(timer).toBeDefined();
    expect(typeof timer.change).toBe('function');
    expect(typeof timer.dispose).toBe('function');

    timer.dispose();
  });

  it('should delay asynchronously using delay()', async () => {
    const start = provider.getTimestamp();
    await provider.delay(20);
    const elapsed = provider.getElapsedTime(start);
    expect(elapsed).toBeGreaterThanOrEqual(15);
  });
});
