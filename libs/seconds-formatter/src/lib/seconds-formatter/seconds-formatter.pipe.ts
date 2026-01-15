import { inject, Pipe, PipeTransform } from '@angular/core';

import { SecondsFormatterService } from './seconds-formatter.service';

@Pipe({ name: 'secondsFormatter' })
export class SecondsFormatterPipe implements PipeTransform {
  private readonly secondsFormatterSvc = inject(SecondsFormatterService);

  transform(value: number | null | undefined, ...args: [boolean | null]): string {
    const computedResult = this.secondsFormatterSvc.getComputedValue(value, args[0]);
    return this.secondsFormatterSvc.computedValueResultToString(computedResult);
  }
}


