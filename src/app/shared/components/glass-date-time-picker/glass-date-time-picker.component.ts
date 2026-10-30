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
import { CalendarDay } from '../glass-date-picker/glass-date-picker.component';

function formatYYYYMMDD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

@Component({
  selector: 'app-glass-date-time-picker',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GlassDateTimePickerComponent),
      multi: true
    }
  ],
  templateUrl: './glass-date-time-picker.component.html'
})
export class GlassDateTimePickerComponent implements ControlValueAccessor {
  public readonly value = model<string>(''); // 'YYYY-MM-DDTHH:mm'
  public readonly label = input<string>('');
  public readonly placeholder = input<string>('Select date & time...');
  public readonly disabled = input<boolean>(false);

  public readonly dateTimeChange = output<string>();

  public readonly isOpen = signal<boolean>(false);
  public readonly activeTab = signal<'date' | 'time'>('date');

  // Internal state
  public readonly selectedDate = signal<string>(''); // YYYY-MM-DD
  public readonly selectedHour = signal<number>(12);
  public readonly selectedMinute = signal<number>(0);

  public readonly viewYear = signal<number>(new Date().getFullYear());
  public readonly viewMonth = signal<number>(new Date().getMonth());

  protected innerDisabled = false;

  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  public readonly monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  public readonly weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  public readonly hoursList: number[] = Array.from({ length: 24 }, (_, i) => i);
  public readonly minutesList: number[] = Array.from({ length: 12 }, (_, i) => i * 5);

  constructor(private elementRef: ElementRef) {
    this.syncFromValue(this.value());
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
    this.syncFromValue(str);
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

  private syncFromValue(val: string): void {
    if (val && val.includes('T')) {
      const [dPart, tPart] = val.split('T');
      this.selectedDate.set(dPart);
      if (tPart) {
        const [h, m] = tPart.split(':').map(Number);
        if (!isNaN(h)) this.selectedHour.set(h);
        if (!isNaN(m)) this.selectedMinute.set(m);
      }
      const [y, mon] = dPart.split('-').map(Number);
      if (!isNaN(y) && !isNaN(mon)) {
        this.viewYear.set(y);
        this.viewMonth.set(mon - 1);
      }
    } else if (val) {
      this.selectedDate.set(val);
    }
  }

  public toggleOpen(): void {
    if (this.isDisabled) return;
    const next = !this.isOpen();
    this.isOpen.set(next);
    if (next) {
      this.activeTab.set('date');
      this.syncFromValue(this.value());
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
    this.selectedDate.set(day.dateString);
    this.activeTab.set('time');
    this.emitCombinedValue();
  }

  public selectHour(h: number, event: Event): void {
    event.stopPropagation();
    this.selectedHour.set(h);
    this.emitCombinedValue();
  }

  public selectMinute(m: number, event: Event): void {
    event.stopPropagation();
    this.selectedMinute.set(m);
    this.emitCombinedValue();
  }

  public setNow(event: Event): void {
    event.stopPropagation();
    const now = new Date();
    this.selectedDate.set(formatYYYYMMDD(now));
    this.selectedHour.set(now.getHours());
    this.selectedMinute.set(now.getMinutes());
    this.viewYear.set(now.getFullYear());
    this.viewMonth.set(now.getMonth());
    this.emitCombinedValue();
    this.isOpen.set(false);
  }

  private emitCombinedValue(): void {
    const d = this.selectedDate() || formatYYYYMMDD(new Date());
    const h = String(this.selectedHour()).padStart(2, '0');
    const m = String(this.selectedMinute()).padStart(2, '0');
    const combined = `${d}T${h}:${m}`;
    this.value.set(combined);
    this.onChange(combined);
    this.onTouched();
    this.dateTimeChange.emit(combined);
  }

  public clear(event?: Event): void {
    if (event) event.stopPropagation();
    this.value.set('');
    this.selectedDate.set('');
    this.onChange('');
    this.onTouched();
    this.dateTimeChange.emit('');
  }

  public pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  public readonly displayDateTime = computed<string>(() => {
    const val = this.value();
    if (!val) return '';
    if (!val.includes('T')) return val;
    const [d, t] = val.split('T');
    return `${d} ${t}`;
  });

  public readonly calendarDays = computed<CalendarDay[]>(() => {
    const year = this.viewYear();
    const month = this.viewMonth();
    const selectedVal = this.selectedDate();
    const todayStr = formatYYYYMMDD(new Date());

    const firstDay = new Date(year, month, 1);
    let dayOfWeek = firstDay.getDay();
    let startOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: CalendarDay[] = [];

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
        isDisabled: false
      });
    }

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
        isDisabled: false
      });
    }

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
        isDisabled: false
      });
    }

    return days;
  });
}
