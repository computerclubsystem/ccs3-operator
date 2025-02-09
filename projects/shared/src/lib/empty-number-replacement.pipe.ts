import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'emptyNumberReplacement' })
export class EmptyNumberReplacementPipe implements PipeTransform {

  transform(value: number | string | null | undefined): string {
    // Support number 0 as well as string '0' and zero amount string '0.00'
    if (!value || value === '0' || value === '0.00') {
      return '.';
    }
    return value.toString();
  }
}
