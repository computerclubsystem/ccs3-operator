import { inject, Injectable } from '@angular/core';
import {
  AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators
} from '@angular/forms';
import { translate } from '@jsverse/transloco';

import { DurationFormControls, FormControls, FromToFormControls } from './declarations';
import { TariffType } from '@ccs3-operator/messages';

@Injectable({ providedIn: 'root' })
export class CreateTariffService {
  private readonly formBuilder = inject(FormBuilder);

  readonly tariffTypeDurationItem = { id: 1, name: translate('Duration') };
  readonly tariffTypeFromToItem = { id: 2, name: translate('From-To') };
  readonly tariffTypeItems = [this.tariffTypeDurationItem, this.tariffTypeFromToItem];

  modifyDurationGroupValidators(durationControls: DurationFormControls, tariffType: TariffType): void {
    const isDuration = tariffType === this.tariffTypeDurationItem.id;
    const validators: ValidatorFn[] = [Validators.required, this.durationValidator]
    if (isDuration) {
      durationControls.duration.setValidators(validators);
      if (durationControls.restrictStart.value) {
        durationControls.restrictStartFromTime.setValidators(validators);
        durationControls.restrictStartToTime.setValidators(validators);
      } else {
        durationControls.restrictStartFromTime.clearValidators();
        durationControls.restrictStartToTime.clearValidators();
      }
    } else {
      durationControls.duration.clearValidators();
      durationControls.restrictStartFromTime.clearValidators();
      durationControls.restrictStartToTime.clearValidators();
    }
    durationControls.duration.updateValueAndValidity();
    durationControls.restrictStartFromTime.updateValueAndValidity();
    durationControls.restrictStartToTime.updateValueAndValidity();
  }

  modifyFromToGroupValidators(fromToControls: FromToFormControls, tariffType: TariffType): void {
    const isFromTo = tariffType === this.tariffTypeFromToItem.id;
    const validators: ValidatorFn[] = [Validators.required, this.durationValidator];
    if (isFromTo) {
      fromToControls.fromTime.setValidators(validators);
      fromToControls.toTime.setValidators(validators);
    } else {
      fromToControls.fromTime.clearValidators();
      fromToControls.toTime.clearValidators();
    }
    fromToControls.fromTime.updateValueAndValidity();
    fromToControls.toTime.updateValueAndValidity();
  }

  createForm(): FormGroup<FormControls> {
    const durationTypeControls: DurationFormControls = {
      duration: new FormControl('', { validators: [Validators.required, this.durationValidator] }),
      restrictStart: new FormControl(false),
      restrictStartFromTime: new FormControl(''),
      restrictStartToTime: new FormControl(''),
    };
    const fromToTypeControls: FromToFormControls = {
      fromTime: new FormControl(''),
      toTime: new FormControl(''),
    };
    const formControls: FormControls = {
      name: new FormControl('', { validators: [Validators.required] }),
      description: new FormControl(),
      enabled: new FormControl(true),
      type: new FormControl(this.tariffTypeItems[0]),
      durationTypeGroup: this.formBuilder.group(durationTypeControls),
      fromToTypeGroup: this.formBuilder.group(fromToTypeControls),
      price: new FormControl(0, { validators: [Validators.required, this.priceValidator] }),
    };
    const form = this.formBuilder.group(formControls);
    return form;
  }

  durationValidator(control: AbstractControl): ValidationErrors {
    if (typeof control.value !== 'string') {
      return { notString: true } as ValidationErrors;
    }
    const valueAsString = control.value as string;
    if (!valueAsString?.trim()) {
      return { notString: true } as ValidationErrors;
    }
    const parts = valueAsString.trim().split(':');
    if (parts.length !== 2) {
      return { notTwoParts: true } as ValidationErrors;
    }
    if (!parts[0].trim() || !parts[1].trim()) {
      return { notTwoParts: true } as ValidationErrors;
    }

    for (const ch of valueAsString) {
      const isAllowed = ch === ':' || (ch >= '0' && ch <= '9');
      if (!isAllowed) {
        return { invalidChar: true } as ValidationErrors;
      }
    }

    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    if (hours < 0 || minutes < 0 || minutes > 59) {
      return { outOfRange: true } as ValidationErrors;
    }
    return {};
  };

  priceValidator(control: AbstractControl): ValidationErrors {
    const valueAsNumber: number = control.value;
    if (isNaN(valueAsNumber)) {
      return { notNumber: true } as ValidationErrors;
    }
    if (valueAsNumber <= 0) {
      return { notPositive: true } as ValidationErrors;
    }
    const parts = valueAsNumber.toString().split('.');
    if (parts.length > 2) {
      return { notNumber: true } as ValidationErrors;
    }
    if (parts.length === 2 && parts[1].length > 2) {
      return { moreThanTwoFractionalDigits: true } as ValidationErrors;
    }
    return {};
  };


  convertTimeToMinutes(time: string): number {
    const trimmedDuration = time.trim();
    const parts = trimmedDuration.split(':');
    const hours = +parts[0];
    const minutes = +parts[1];
    return hours * 60 + minutes;
  }

  convertMinutesToTime(value?: number | null): string | null {
    if (value === undefined || value === null) {
      return null;
    }

    const hours = Math.floor(value / 60)
    const minutes = value % 60

    const padValue = (value: number): string => value.toString().padStart(2, '0');
    const zeroPaddedMinutes = padValue(minutes);
    const result = `${hours}:${zeroPaddedMinutes}`;
    return result;
  }
}
