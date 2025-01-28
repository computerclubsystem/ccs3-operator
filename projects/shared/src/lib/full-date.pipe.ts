import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({ name: 'fullDate', standalone: true })
export class FullDatePipe implements PipeTransform {

  transform(value: any, ...args: any[]) {
    return formatDate(value, 'yyyy-MM-dd HH:mm:ss', '');
  }
}
