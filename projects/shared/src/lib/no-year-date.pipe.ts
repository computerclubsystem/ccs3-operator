import { inject, Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({ name: 'noYearDate', standalone: true })
export class NoYearDatePipe implements PipeTransform {
  private datePipe = inject(DatePipe);

  transform(value: Date | string | number | null): string | null {
    return this.datePipe.transform(value, 'MMM-dd HH:mm:ss');
  }
}
