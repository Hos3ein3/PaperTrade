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

function formatTime(hours: number, minutes: number): string {
  const h = String(hours).padStart(2, '0');
  const m = String(minutes).padStart(2, '0');
  return `${h}:${m}`;
}

@Component({
  selector: 'app-glass-time-picker',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GlassTimePickerComponent),
      multi: true
    }
  ],
  templateUrl: './glass-time-picker.component.html'
})
export class GlassTimePickerComponent implements ControlValueAccessor {
  public readonly value = model<string>(''); // 'HH:mm'
  public readonly label = input<string>('');
  public readonly placeholder = input<string>('Select time...');
  public readonly disabled = input<boolean>(false);
  public readonly minuteStep = input<number>(5);

  public readonly timeChange = output<string>();

  public readonly isOpen = signal<boolean>(false);

  // Parsed internal hours and minutes
  public readonly selectedHour = signal<number>(12);
  public readonly selectedMinute = signal<number>(0);

  protected innerDisabled = false;

  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  public readonly hoursList: number[] = Array.from({ length: 24 }, (_, i) => i);

  public readonly minutesList = computed<number[]>(() => {
    const step = Math.max(1, Math.min(30, this.minuteStep()));
    const list: number[] = [];
    for (let m = 0; m < 60; m += step) {
      list.push(m);
    }
    if (!list.includes(59)) {
      list.push(59);
    }
    return list;
  });

  public readonly presets = [
    { label: 'Now', time: 'NOW' },
    { label: '09:30 Open', time: '09:30' },
    { label: '12:00 Noon', time: '12:00' },
    { label: '16:00 Close', time: '16:00' },
  ];

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
    if (val && /^\d{2}:\d{2}/.test(val)) {
      const [h, m] = val.split(':').map(Number);
      if (!isNaN(h) && h >= 0 && h < 24) this.selectedHour.set(h);
      if (!isNaN(m) && m >= 0 && m < 60) this.selectedMinute.set(m);
    }
  }

  public toggleOpen(): void {
    if (this.isDisabled) return;
    const next = !this.isOpen();
    this.isOpen.set(next);
    if (next && this.value()) {
      this.syncFromValue(this.value());
    }
  }

  public selectHour(h: number, event: Event): void {
    event.stopPropagation();
    this.selectedHour.set(h);
    this.applyTime();
  }

  public selectMinute(m: number, event: Event): void {
    event.stopPropagation();
    this.selectedMinute.set(m);
    this.applyTime();
  }

  public applyPreset(presetTime: string, event: Event): void {
    event.stopPropagation();
    if (presetTime === 'NOW') {
      const now = new Date();
      this.selectedHour.set(now.getHours());
      this.selectedMinute.set(now.getMinutes());
    } else {
      const [h, m] = presetTime.split(':').map(Number);
      this.selectedHour.set(h);
      this.selectedMinute.set(m);
    }
    this.applyTime();
    this.isOpen.set(false);
  }

  private applyTime(): void {
    const str = formatTime(this.selectedHour(), this.selectedMinute());
    this.value.set(str);
    this.onChange(str);
    this.onTouched();
    this.timeChange.emit(str);
  }

  public clear(event?: Event): void {
    if (event) event.stopPropagation();
    this.value.set('');
    this.onChange('');
    this.onTouched();
    this.timeChange.emit('');
  }

  public pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  public readonly displayTime = computed<string>(() => {
    const val = this.value();
    if (!val) return '';
    return val;
  });
}
