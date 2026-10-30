import { Pipe, PipeTransform, inject } from '@angular/core';
import { TimeService, CetFormatType } from '../../core/services/time.service';

@Pipe({
  name: 'cetDate',
  standalone: true,
})
export class CetDatePipe implements PipeTransform {
  private readonly timeService = inject(TimeService);

  public transform(value: string | number | Date | null | undefined, format: CetFormatType = 'datetime'): string {
    return this.timeService.formatCet(value, format);
  }
}
