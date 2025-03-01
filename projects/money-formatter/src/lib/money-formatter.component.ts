import { ChangeDetectionStrategy, Component, computed, input, Signal } from '@angular/core';

@Component({
  selector: 'ccs3-op-money-formatter',
  imports: [],
  templateUrl: 'money-formatter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoneyFormatterComponent {
  value = input<number | undefined | null>(0);
  signals = this.createSignals();

  getComputedValue(value?: number | null): ComputedValueResult {
    if (!value) {
      return {
        main: 0,
        mainText: '0',
        fractional: 0,
        fractionalText: '00',
      };
    }
    const mainValue = Math.trunc(value);
    const fractionalValue = Math.floor(this.roundAmount((value % 1) * 100));
    const mainText = `${mainValue}`;
    const fractionalText = `${fractionalValue}`.padStart(2, '0');
    const result: ComputedValueResult = {
      main: mainValue,
      mainText: mainText,
      fractional: fractionalValue,
      fractionalText: fractionalText,
    };
    return result;
  }

  roundAmount(amount: number): number {
    return Math.round(amount * 100) / 100;
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
  main: number;
  mainText: string;
  fractional: number;
  fractionalText: string;
}
