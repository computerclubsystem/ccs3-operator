import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'moneyFormat' })
export class MoneyFormatPipe implements PipeTransform {

  transform(value: number | null | undefined): string {
    if (!value) {
      return '0';
    }
    const mainValue = Math.trunc(value);
    const fractionalValue = Math.floor((value % 1) * 100);
    const mainText = `${mainValue}`;
    const fractionalText = `${fractionalValue}`.padStart(2, '0');
    const result = `${mainText}.${fractionalText}`;
    return result;
  }
}
