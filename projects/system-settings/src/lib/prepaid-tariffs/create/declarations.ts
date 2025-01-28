import { WritableSignal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { Tariff } from '@ccs3-operator/messages';

export interface FormControls {
  name: FormControl<string | null>;
  description: FormControl<string | null>;
  durationGroup: FormGroup<DurationFormControls>;
  price: FormControl<number | null>;
  enabled: FormControl<boolean | null>;
  canBeStartedByCustomer: FormControl<boolean | null>;
  setPassword: FormControl<boolean | null>;
  password: FormControl<string | null>;
  confirmPassword: FormControl<string | null>;
}

export interface DurationFormControls {
  duration: FormControl<string | null>;
}

export interface Signals {
  durationHasNotTwoPartsError: WritableSignal<boolean>;
  durationHasOutOfRangeError: WritableSignal<boolean>;
  durationHasInvalidCharError: WritableSignal<boolean>;
  priceHasError: WritableSignal<boolean>;
  priceHasMoreThanTwoFractionalDigitsError: WritableSignal<boolean>;
  isCreate: WritableSignal<boolean>;
  isLoading: WritableSignal<boolean>;
  tariff: WritableSignal<Tariff | null>;
  createdTariff: WritableSignal<Tariff | null>;
  showPasswords: WritableSignal<boolean>;
  initialDuration: WritableSignal<string | null>;
  initialPrice: WritableSignal<number | null>;
  rechargingTariffInProgress: WritableSignal<boolean>;
}
