import { ChangeDetectionStrategy, Component, computed, input, Signal } from '@angular/core';
import { translate, TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'ccs3-op-seconds-formatter',
  templateUrl: 'seconds-formatter.component.html',
  standalone: true,
  imports: [TranslocoDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecondsFormatterComponent {
  value = input<number | undefined | null>(0);
  traditionalDisplay = input<boolean | undefined | null>(false);

  signals = this.createSignals();

  getComputedValue(value?: number | null): ComputedValueResult {
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
    if (this.traditionalDisplay()) {
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

  createComputedValueResult(hours: number, minutes: number, seconds: number): ComputedValueResult {
    const result: ComputedValueResult = {
      hours: hours,
      hoursText: '',
      minutes: minutes,
      minutesText: '',
      seconds: seconds,
      secondsText: '',
    };
    return result;
  }

  padValue(value: number): string {
    return value.toString().padStart(2, '0');
  }

  createSignals(): Signals {
    const signals: Signals = {
      computedValue: computed(() => this.getComputedValue(this.value()))
    };
    return signals;
  }
}

interface Signals {
  computedValue: Signal<ComputedValueResult>;
}

interface ComputedValueResult {
  hours: number;
  hoursText: string;
  minutes: number;
  minutesText: string;
  seconds: number;
  secondsText: string;
}
