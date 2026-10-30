import { Component, forwardRef, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type CheckboxColor = 'brand' | 'bullish' | 'amber' | 'bearish';
export type CheckboxSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-glass-checkbox',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GlassCheckboxComponent),
      multi: true
    }
  ],
  templateUrl: './glass-checkbox.component.html'
})
export class GlassCheckboxComponent implements ControlValueAccessor {
  public readonly checked = model<boolean>(false);
  public readonly indeterminate = input<boolean>(false);
  public readonly label = input<string>('');
  public readonly description = input<string>('');
  public readonly disabled = input<boolean>(false);
  public readonly color = input<CheckboxColor>('brand');
  public readonly size = input<CheckboxSize>('md');

  public readonly change = output<boolean>();

  protected innerDisabled = false;

  private onChange: (val: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  public writeValue(value: any): void {
    this.checked.set(Boolean(value));
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

  protected get isDisabled(): boolean {
    return this.disabled() || this.innerDisabled;
  }

  public toggle(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (this.isDisabled) return;

    const next = !this.checked();
    this.checked.set(next);
    this.onChange(next);
    this.onTouched();
    this.change.emit(next);
  }

  public onKeyDown(event: KeyboardEvent): void {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.toggle();
    }
  }

  protected boxSizeClass(): string {
    switch (this.size()) {
      case 'sm':
        return 'w-4 h-4 rounded-md text-[9px]';
      case 'lg':
        return 'w-6 h-6 rounded-xl text-xs';
      case 'md':
      default:
        return 'w-5 h-5 rounded-lg text-[11px]';
    }
  }

  protected checkedClass(): string {
    const isChecked = this.checked() || this.indeterminate();
    if (!isChecked) {
      return 'bg-slate-100/80 dark:bg-white/5 border-slate-300 dark:border-white/20 group-hover:border-brand-500/50 group-hover:bg-brand-500/5';
    }

    switch (this.color()) {
      case 'bullish':
        return 'bg-emerald-600 border-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]';
      case 'amber':
        return 'bg-amber-500 border-amber-400 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)]';
      case 'bearish':
        return 'bg-rose-600 border-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.4)]';
      case 'brand':
      default:
        return 'bg-brand-600 border-brand-500 text-white shadow-[0_0_12px_rgba(20,184,166,0.4)]';
    }
  }
}
