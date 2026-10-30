import { Injectable, inject } from '@angular/core';
import { TimeProvider, TimeFormatStyle } from '../time/time-provider';
import { PreferredTimeZone } from '../time/time-zone.models';

export type CetFormatType = TimeFormatStyle;

@Injectable({
  providedIn: 'root',
})
export class TimeService {
  private readonly timeProvider = inject(TimeProvider);

  public readonly timeZone = 'Europe/Berlin';

  /**
   * Formats a given UTC/ISO date string or Date object into Central European Time (CET/CEST).
   */
  public formatCet(date: string | number | Date | null | undefined, format: CetFormatType = 'datetime'): string {
    return this.timeProvider.format(date, format, PreferredTimeZone.CentralEuropean);
  }

  /**
   * Returns current CET time label with timezone indicator (e.g. "CET" or "CEST").
   */
  public getCurrentCetString(): string {
    return this.formatCet(new Date(), 'full');
  }
}
