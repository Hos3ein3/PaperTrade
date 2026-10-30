import { TestBed } from '@angular/core/testing';
import { TimeService } from './time.service';

describe('TimeService', () => {
  let service: TimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimeService);
  });

  it('should format UTC timestamp into Central European Time (CET/CEST)', () => {
    // 2026-01-15T12:00:00Z in winter is CET (UTC+1) -> 13:00
    const winterUtc = '2026-01-15T12:00:00Z';
    const formatted = service.formatCet(winterUtc, 'time');
    expect(formatted).toBe('13:00:00');
  });

  it('should handle summer daylight saving time as CEST (UTC+2)', () => {
    // 2026-07-15T12:00:00Z in summer is CEST (UTC+2) -> 14:00
    const summerUtc = '2026-07-15T12:00:00Z';
    const formatted = service.formatCet(summerUtc, 'time');
    expect(formatted).toBe('14:00:00');
  });

  it('should gracefully handle null or undefined input', () => {
    expect(service.formatCet(null)).toBe('--');
    expect(service.formatCet(undefined)).toBe('--');
  });
});
