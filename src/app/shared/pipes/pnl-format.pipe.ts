import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pnlFormat',
  standalone: true,
})
export class PnlFormatPipe implements PipeTransform {
  transform(
    value: number | string | null | undefined,
    currencySymbol: string = '$',
    includePlus: boolean = true
  ): string {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return `${currencySymbol}0.00`;
    }

    const num = Number(value);
    const formatted = Math.abs(num).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    if (num > 0) {
      return `${includePlus ? '+' : ''}${currencySymbol}${formatted}`;
    } else if (num < 0) {
      return `-${currencySymbol}${formatted}`;
    } else {
      return `${currencySymbol}0.00`;
    }
  }
}
