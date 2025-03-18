import { WritableSignal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { DeviceGroup, Tariff } from '@ccs3-operator/messages';
import { NumericIdWithName } from '@ccs3-operator/shared/types';

export interface FormControls {
  name: FormControl<string | null>;
  description: FormControl<string | null>;
  type: FormControl<NumericIdWithName | null>;
  durationTypeGroup: FormGroup<DurationFormControls>;
  fromToTypeGroup: FormGroup<FromToFormControls>;
  price: FormControl<number | null>;
  enabled: FormControl<boolean | null>;
}

export interface DurationFormControls {
  duration: FormControl<string | null>;
  restrictStart: FormControl<boolean | null>;
  restrictStartFromTime: FormControl<string | null>;
  restrictStartToTime: FormControl<string | null>;
}

export interface FromToFormControls {
  fromTime: FormControl<string | null>;
  toTime: FormControl<string | null>;
}

export interface Signals {
  showDurationTypeSettings: WritableSignal<boolean>;
  durationHasNotTwoPartsError: WritableSignal<boolean>;
  durationHasOutOfRangeError: WritableSignal<boolean>;
  durationHasInvalidCharError: WritableSignal<boolean>;
  showFromToTypeSettings: WritableSignal<boolean>;
  showRestrictStartPeriodSettings: WritableSignal<boolean>;
  priceHasError: WritableSignal<boolean>;
  priceHasMoreThanTwoFractionalDigitsError: WritableSignal<boolean>;
  isCreate: WritableSignal<boolean>;
  isLoading: WritableSignal<boolean>;
  tariff: WritableSignal<Tariff | null>;
  tariffDeviceGroups: WritableSignal<DeviceGroup[]>;
  availableDeviceGroups: WritableSignal<DeviceGroup[]>;
}
