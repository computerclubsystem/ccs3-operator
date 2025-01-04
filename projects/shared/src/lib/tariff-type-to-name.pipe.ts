import { Pipe, PipeTransform } from '@angular/core';
import { TariffType } from '@ccs3-operator/messages';

@Pipe({ name: 'tariffTypeToName', standalone: true })
export class TariffTypeToNamePipe implements PipeTransform {

  transform(value: any, ...args: any[]) {
    const tariffType = value as TariffType;
    switch (tariffType) {
      case TariffType.duration:
        return 'Duration';
      case TariffType.fromTo:
        return 'From-To';
      default:
        return `${tariffType}`;
    }
  }
}
