import { inject, Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({ name: 'fullDate', standalone: true })
export class FullDatePipe implements PipeTransform {
  private datePipe = inject(DatePipe);

  transform(value: any, ...args: any[]) {
    return this.datePipe.transform(value, 'yyyy-MM-dd HH:mm:ss');
  }
}
