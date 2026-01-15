import { Injectable } from '@angular/core';
import { translate } from '@jsverse/transloco';

import { ComputedValueResult } from './declarations';

@Injectable({ providedIn: 'root' })
export class SecondsFormatterService {
  computedValueResultToString(computedValueResult: ComputedValueResult): string {
    return `${computedValueResult.hoursText || ''}${computedValueResult.minutesText || ''}${computedValueResult.secondsText || ''}`;
  }

  getComputedValue(value?: number | null, traditionalDisplay?: boolean | null): ComputedValueResult {
    if (!value || isNaN(value)) {
      value = 0;
    }
    const totalSeconds = +value;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const seconds = totalSeconds % 60;
    const result = {
      hours,
      minutes,
      seconds,
    } as ComputedValueResult;
    if (traditionalDisplay) {
      // Format as zero-padded values like '0:00:01'
      result.hoursText = `${hours}`;
      result.minutesText = this.padValue(minutes);
      result.secondsText = this.padValue(seconds);
      return result;
    } else {
      // Format by adding abbreviatures
      if (result.hours) {
        result.hoursText = `${result.hours}${translate('Hours abbreviation')}`;
      }
      if (result.minutes) {
        result.minutesText = `${result.minutes}${translate('Minutes abbreviation')}`;
      }
      result.secondsText = `${result.seconds}${translate('Seconds abbreviation')}`;
      return result;
    }
  }

  padValue(value: number): string {
    return value.toString().padStart(2, '0');
  }
}
