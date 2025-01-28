import { inject, Pipe, PipeTransform } from '@angular/core';

import { SecondsFormatterService } from './seconds-formatter.service';

@Pipe({ name: 'secondsFormatter', standalone: true })
export class SecondsFormatterPipe implements PipeTransform {
  private readonly secondsFormatterSvc = inject(SecondsFormatterService);

  transform(value: any, ...args: any[]) {
    const computedResult = this.secondsFormatterSvc.getComputedValue(value, args[0]);
    return this.secondsFormatterSvc.computedValueResultToSring(computedResult);
  }
}


