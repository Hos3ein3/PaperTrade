import { Injectable } from '@angular/core';
import {
  PreferredTimeZone,
  TimeZoneDefinition,
  TIME_ZONE_DEFINITIONS,
  getTimeZoneDefinition,
} from './time-zone.models';

/**
 * Disposable timer contract mirroring .NET System.Threading.ITimer.
 */
export interface ITimer {
  change(dueTimeMs: number, periodMs?: number): boolean;
  dispose(): void;
}

class StandardTimer implements ITimer {
  private timeoutId: any = null;
  private intervalId: any = null;
  private isDisposed = false;

  constructor(
    private readonly callback: (state?: any) => void,
    dueTimeMs: number,
    periodMs?: number,
    private readonly state?: any
  ) {
    this.schedule(dueTimeMs, periodMs);
  }

  public change(dueTimeMs: number, periodMs?: number): boolean {
    if (this.isDisposed) return false;
    this.clear();
    this.schedule(dueTimeMs, periodMs);
    return true;
  }

  public dispose(): void {
    if (this.isDisposed) return;
    this.isDisposed = true;
    this.clear();
  }

  private schedule(dueTimeMs: number, periodMs?: number): void {
    if (dueTimeMs < 0) return;

    this.timeoutId = setTimeout(() => {
      this.timeoutId = null;
      if (this.isDisposed) return;

      this.callback(this.state);

      if (periodMs !== undefined && periodMs > 0 && !this.isDisposed) {
        this.intervalId = setInterval(() => {
          if (this.isDisposed) {
            this.clear();
            return;
          }
          this.callback(this.state);
        }, periodMs);
      }
    }, dueTimeMs);
  }

  private clear(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export type TimeFormatStyle = 'full' | 'short' | 'time' | 'date' | 'datetime';

/**
 * Abstraction for date, time, timers, and timestamps inspired directly by
 * .NET 8 / 9 / 10 System.TimeProvider.
 *
 * Provides deterministic time retrieval, timezone conversion, high-resolution
 * timestamps via performance.now(), cancellable timers, and asynchronous delays.
 */
@Injectable({
  providedIn: 'root',
})
export class TimeProvider {
  /**
   * Default singleton system instance matching C# TimeProvider.System.
   */
  public static readonly System: TimeProvider = new TimeProvider();

  protected _preferredTimeZone: PreferredTimeZone = PreferredTimeZone.Utc;

  /**
   * Sets the active preferred timezone for the provider instance.
   */
  public setPreferredTimeZone(tz: PreferredTimeZone | string | number): void {
    const def = getTimeZoneDefinition(tz);
    this._preferredTimeZone = def.enumValue;
  }

  /**
   * Gets the active preferred timezone enum.
   */
  public get preferredTimeZone(): PreferredTimeZone {
    return this._preferredTimeZone;
  }

  /**
   * Gets the IANA identifier representing the local / active time zone (e.g. "Europe/Berlin", "UTC").
   * Mirrors C# TimeProvider.LocalTimeZone.
   */
  public get localTimeZone(): string {
    return getTimeZoneDefinition(this._preferredTimeZone).iana;
  }

  /**
   * Gets the current date and time in Coordinated Universal Time (UTC).
   * Mirrors C# TimeProvider.GetUtcNow().
   */
  public getUtcNow(): Date {
    return new Date();
  }

  /**
   * Gets the current date and time in the provider's active time zone (or specified time zone).
   * Mirrors C# TimeProvider.GetLocalNow().
   */
  public getLocalNow(timeZone?: PreferredTimeZone | string | number): Date {
    const targetTz = timeZone !== undefined ? getTimeZoneDefinition(timeZone).iana : this.localTimeZone;
    return this.toTimeZone(new Date(), targetTz);
  }

  /**
   * Gets the high-frequency timestamp value in milliseconds.
   * Mirrors C# TimeProvider.GetTimestamp().
   */
  public getTimestamp(): number {
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      return performance.now();
    }
    return Date.now();
  }

  /**
   * Gets the elapsed time in milliseconds between two timestamps obtained via GetTimestamp().
   * Mirrors C# TimeProvider.GetElapsedTime(startingTimestamp, endingTimestamp).
   */
  public getElapsedTime(startingTimestamp: number, endingTimestamp?: number): number {
    const end = endingTimestamp !== undefined ? endingTimestamp : this.getTimestamp();
    return Math.max(0, end - startingTimestamp);
  }

  /**
   * Creates an ITimer instance that triggers after dueTimeMs and repeats every periodMs.
   * Mirrors C# TimeProvider.CreateTimer(callback, state, dueTime, period).
   */
  public createTimer(
    callback: (state?: any) => void,
    dueTimeMs: number,
    periodMs?: number,
    state?: any
  ): ITimer {
    return new StandardTimer(callback, dueTimeMs, periodMs, state);
  }

  /**
   * Creates a Promise that resolves after a specified duration in milliseconds.
   * Mirrors C# TimeProvider.Delay(delay, cancellationToken).
   */
  public delay(durationMs: number, abortSignal?: AbortSignal): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (abortSignal?.aborted) {
        return reject(new DOMException('Delay was cancelled', 'AbortError'));
      }

      const timerId = setTimeout(() => {
        resolve();
      }, Math.max(0, durationMs));

      if (abortSignal) {
        abortSignal.addEventListener(
          'abort',
          () => {
            clearTimeout(timerId);
            reject(new DOMException('Delay was cancelled', 'AbortError'));
          },
          { once: true }
        );
      }
    });
  }

  /**
   * Converts a given Date, ISO string, or timestamp into a Date shifted to the target timezone.
   */
  public toTimeZone(date: Date | string | number, timeZone?: PreferredTimeZone | string | number): Date {
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    if (isNaN(d.getTime())) return new Date();

    const iana = timeZone !== undefined ? getTimeZoneDefinition(timeZone).iana : this.localTimeZone;
    try {
      const invDate = new Date(
        d.toLocaleString('en-US', {
          timeZone: iana,
        })
      );
      const diff = d.getTime() - invDate.getTime();
      return new Date(d.getTime() - diff);
    } catch {
      return d;
    }
  }

  /**
   * Formats a date into a localized string formatted according to the given style and timezone.
   */
  public format(
    date: Date | string | number | null | undefined,
    formatStyle: TimeFormatStyle = 'datetime',
    timeZone?: PreferredTimeZone | string | number
  ): string {
    if (!date) return '--';

    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '--';

    const iana = timeZone !== undefined ? getTimeZoneDefinition(timeZone).iana : this.localTimeZone;

    const options: Intl.DateTimeFormatOptions = {
      timeZone: iana,
    };

    switch (formatStyle) {
      case 'time':
        options.hour = '2-digit';
        options.minute = '2-digit';
        options.second = '2-digit';
        options.hour12 = false;
        break;
      case 'date':
        options.year = 'numeric';
        options.month = 'short';
        options.day = '2-digit';
        break;
      case 'short':
        options.month = '2-digit';
        options.day = '2-digit';
        options.hour = '2-digit';
        options.minute = '2-digit';
        options.hour12 = false;
        break;
      case 'full':
        options.year = 'numeric';
        options.month = 'long';
        options.day = '2-digit';
        options.hour = '2-digit';
        options.minute = '2-digit';
        options.second = '2-digit';
        options.hour12 = false;
        options.timeZoneName = 'short';
        break;
      case 'datetime':
      default:
        options.year = 'numeric';
        options.month = 'short';
        options.day = '2-digit';
        options.hour = '2-digit';
        options.minute = '2-digit';
        options.second = '2-digit';
        options.hour12 = false;
        break;
    }

    try {
      return new Intl.DateTimeFormat('en-GB', options).format(d);
    } catch {
      return d.toLocaleString();
    }
  }

  /**
   * Returns all available time zone definitions for UI dropdowns.
   */
  public getAvailableTimeZones(): TimeZoneDefinition[] {
    return Object.values(TIME_ZONE_DEFINITIONS);
  }
}
