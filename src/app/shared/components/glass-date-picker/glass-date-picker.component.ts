import {
  Component,
  ElementRef,
  HostListener,
  computed,
  forwardRef,
  input,
  model,
  output,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface CalendarDay {
  date: Date;
  dateString: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
}

function formatYYYYMMDD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseYYYYMMDD(s: string): Date | null {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split('-').map(Number);
  const parsed = new Date(y, m - 1, d);
  return isNaN(parsed.getTime()) ? null : parsed;
}

@Component({
  selector: 'app-glass-date-picker',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GlassDatePickerComponent),
      multi: true
    }
  ],
  templateUrl: './glass-date-picker.component.html'
})
export class GlassDatePickerComponent implements ControlValueAccessor {
  public readonly value = model<string>('');
  public readonly label = input<string>('');
  public readonly placeholder = input<string>('Select date...');
  public readonly min = input<string>('');
  public readonly max = input<string>('');
  public readonly disabled = input<boolean>(false);
  public readonly showQuickToday = input<boolean>(true);

  public readonly dateChange = output<string>();

  public readonly isOpen = signal<boolean>(false);
  public readonly viewYear = signal<number>(new Date().getFullYear());
  public readonly viewMonth = signal<number>(new Date().getMonth()); // 0-indexed

  protected innerDisabled = false;

  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  public readonly monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  public readonly weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  constructor(private elementRef: ElementRef) {
    // If value changes, sync view year and month
    const initial = parseYYYYMMDD(this.value());
    if (initial) {
      this.viewYear.set(initial.getFullYear());
      this.viewMonth.set(initial.getMonth());
    }
  }

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  public writeValue(val: any): void {
    const str = typeof val === 'string' ? val : '';
    this.value.set(str);
    const parsed = parseYYYYMMDD(str);
    if (parsed) {
      this.viewYear.set(parsed.getFullYear());
      this.viewMonth.set(parsed.getMonth());
    }
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.innerDisabled = isDisabled;
  }

  public get isDisabled(): boolean {
    return this.disabled() || this.innerDisabled;
  }

  public toggleOpen(): void {
    if (this.isDisabled) return;
    const next = !this.isOpen();
    this.isOpen.set(next);
    if (next) {
      const parsed = parseYYYYMMDD(this.value()) || new Date();
      this.viewYear.set(parsed.getFullYear());
      this.viewMonth.set(parsed.getMonth());
    }
  }

  public prevMonth(event: Event): void {
    event.stopPropagation();
    let m = this.viewMonth() - 1;
    let y = this.viewYear();
    if (m < 0) {
      m = 11;
      y -= 1;
    }
    this.viewMonth.set(m);
    this.viewYear.set(y);
  }

  public nextMonth(event: Event): void {
    event.stopPropagation();
    let m = this.viewMonth() + 1;
    let y = this.viewYear();
    if (m > 11) {
      m = 0;
      y += 1;
    }
    this.viewMonth.set(m);
    this.viewYear.set(y);
  }

  public selectDay(day: CalendarDay, event: Event): void {
    event.stopPropagation();
    if (day.isDisabled) return;

    this.value.set(day.dateString);
    this.onChange(day.dateString);
    this.onTouched();
    this.dateChange.emit(day.dateString);
    this.isOpen.set(false);
  }

  public selectToday(event: Event): void {
    event.stopPropagation();
    const today = new Date();
    const str = formatYYYYMMDD(today);
    this.value.set(str);
    this.viewYear.set(today.getFullYear());
    this.viewMonth.set(today.getMonth());
    this.onChange(str);
    this.onTouched();
    this.dateChange.emit(str);
    this.isOpen.set(false);
  }

  public clear(event?: Event): void {
    if (event) event.stopPropagation();
    this.value.set('');
    this.onChange('');
    this.onTouched();
    this.dateChange.emit('');
  }

  public readonly displayDate = computed<string>(() => {
    const val = this.value();
    if (!val) return '';
    const parsed = parseYYYYMMDD(val);
    if (!parsed) return val;
    // Format: 'Oct 30, 2026'
    return parsed.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  });

  public readonly calendarDays = computed<CalendarDay[]>(() => {
    const year = this.viewYear();
    const month = this.viewMonth();
    const selectedVal = this.value();
    const todayStr = formatYYYYMMDD(new Date());
    const minVal = this.min();
    const maxVal = this.max();

    const firstDay = new Date(year, month, 1);
    // Sunday is 0, Monday is 1, ..., Saturday is 6
    // We want Monday as start of week (0):
    let dayOfWeek = firstDay.getDay(); // 0 is Sunday, 1 is Monday
    let startOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // days from prev month

    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: CalendarDay[] = [];

    // Leading days from previous month
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, d);
      const str = formatYYYYMMDD(prevDate);
      days.push({
        date: prevDate,
        dateString: str,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: str === todayStr,
        isSelected: str === selectedVal,
        isDisabled: Boolean((minVal && str < minVal) || (maxVal && str > maxVal))
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const currDate = new Date(year, month, d);
      const str = formatYYYYMMDD(currDate);
      days.push({
        date: currDate,
        dateString: str,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: str === todayStr,
        isSelected: str === selectedVal,
        isDisabled: Boolean((minVal && str < minVal) || (maxVal && str > maxVal))
      });
    }

    // Trailing days to fill 35 or 42 grid slots
    const totalSlots = days.length <= 35 ? 35 : 42;
    const remaining = totalSlots - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      const str = formatYYYYMMDD(nextDate);
      days.push({
        date: nextDate,
        dateString: str,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: str === todayStr,
        isSelected: str === selectedVal,
        isDisabled: Boolean((minVal && str < minVal) || (maxVal && str > maxVal))
      });
    }

    return days;
  });
}
