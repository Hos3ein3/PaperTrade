import { Component, forwardRef, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type RadioVariant = 'default' | 'card';
export type RadioColor = 'brand' | 'bullish' | 'bearish';

@Component({
  selector: 'app-glass-radio',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GlassRadioComponent),
      multi: true
    }
  ],
  templateUrl: './glass-radio.component.html'
})
export class GlassRadioComponent implements ControlValueAccessor {
  public readonly value = input<any>(null);
  public readonly name = input<string>('');
  public readonly label = input<string>('');
  public readonly description = input<string>('');
  public readonly variant = input<RadioVariant>('default');
  public readonly color = input<RadioColor>('brand');
  public readonly disabled = input<boolean>(false);
  public readonly checked = input<boolean | undefined>(undefined);
  public readonly icon = input<string>('');

  public readonly selected = output<any>();

  protected modelValue = signal<any>(null);
  protected innerDisabled = false;

  private onChange: (val: any) => void = () => {};
  private onTouched: () => void = () => {};

  public writeValue(val: any): void {
    this.modelValue.set(val);
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

  public get isChecked(): boolean {
    if (this.checked() !== undefined) {
      return Boolean(this.checked());
    }
    return this.modelValue() === this.value();
  }

  public get isDisabled(): boolean {
    return this.disabled() || this.innerDisabled;
  }

  public select(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (this.isDisabled) return;

    this.modelValue.set(this.value());
    this.onChange(this.value());
    this.onTouched();
    this.selected.emit(this.value());
  }

  public onKeyDown(event: KeyboardEvent): void {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.select();
    }
  }

  protected getRingClass(): string {
    if (this.isChecked) {
      switch (this.color()) {
        case 'bullish':
          return 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.35)]';
        case 'bearish':
          return 'border-rose-500 bg-rose-500/10 shadow-[0_0_12px_rgba(244,63,94,0.35)]';
        case 'brand':
        default:
          return 'border-brand-500 bg-brand-500/10 shadow-[0_0_12px_rgba(20,184,166,0.35)]';
      }
    }
    return 'border-slate-300 dark:border-white/20 bg-slate-100/80 dark:bg-white/5 group-hover:border-brand-500/50';
  }

  protected getDotClass(): string {
    switch (this.color()) {
      case 'bullish':
        return 'bg-emerald-500';
      case 'bearish':
        return 'bg-rose-500';
      case 'brand':
      default:
        return 'bg-brand-500';
    }
  }

  protected getCardClass(): string {
    if (this.variant() !== 'card') {
      return '';
    }

    if (this.isChecked) {
      switch (this.color()) {
        case 'bullish':
          return 'bg-emerald-500/10 border-emerald-500/40 text-emerald-950 dark:text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.15)]';
        case 'bearish':
          return 'bg-rose-500/10 border-rose-500/40 text-rose-950 dark:text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.15)]';
        case 'brand':
        default:
          return 'bg-brand-500/10 border-brand-500/40 text-brand-950 dark:text-brand-200 shadow-[0_0_15px_rgba(20,184,166,0.15)]';
      }
    }

    return 'bg-slate-100/60 dark:bg-white/5 border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-100/90 dark:hover:bg-white/8';
  }
}
