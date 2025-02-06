import { ChangeDetectionStrategy, Component, computed, inject, input, Signal } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

import { ComputedValueResult } from './declarations';
import { SecondsFormatterService } from './seconds-formatter.service';

@Component({
  selector: 'ccs3-op-seconds-formatter',
  templateUrl: 'seconds-formatter.component.html',
  imports: [TranslocoDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecondsFormatterComponent {
  value = input<number | undefined | null>(0);
  traditionalDisplay = input<boolean | undefined | null>(false);

  private readonly secondsFormatterSvc = inject(SecondsFormatterService);

  signals = this.createSignals();

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

  createSignals(): Signals {
    const signals: Signals = {
      computedValue: computed(() => this.secondsFormatterSvc.getComputedValue(this.value(), this.traditionalDisplay()))
    };
    return signals;
  }
}

interface Signals {
  computedValue: Signal<ComputedValueResult>;
}
