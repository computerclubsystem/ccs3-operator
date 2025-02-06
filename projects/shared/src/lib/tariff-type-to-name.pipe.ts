import { Pipe, PipeTransform } from '@angular/core';
import { TariffType } from '@ccs3-operator/messages';

@Pipe({ name: 'tariffTypeToName' })
export class TariffTypeToNamePipe implements PipeTransform {

  transform(value: TariffType): string {
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
