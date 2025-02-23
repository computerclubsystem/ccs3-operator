import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { translate } from '@jsverse/transloco';

import { DurationFormControls, FormControls, FromToFormControls } from './declarations';
import { TariffType } from '@ccs3-operator/messages';
import { ValidatorsService } from '@ccs3-operator/shared';

@Injectable({ providedIn: 'root' })
export class CreateTariffService {
  private readonly formBuilder = inject(FormBuilder);
  private readonly validatorsSvc = inject(ValidatorsService);

  readonly tariffTypeDurationItem = { id: 1, name: translate('Duration') };
  readonly tariffTypeFromToItem = { id: 2, name: translate('From-To') };
  readonly tariffTypeItems = [this.tariffTypeDurationItem, this.tariffTypeFromToItem];

  modifyDurationGroupValidators(durationControls: DurationFormControls, tariffType: TariffType): void {
    const isDuration = tariffType === this.tariffTypeDurationItem.id;
    const validators: ValidatorFn[] = [Validators.required, this.validatorsSvc.durationValidator];
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
    const validators: ValidatorFn[] = [Validators.required, this.validatorsSvc.durationValidator];
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
      duration: new FormControl('', { validators: [Validators.required, this.validatorsSvc.durationValidator] }),
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
      price: new FormControl(0, { validators: [Validators.required, this.validatorsSvc.priceValidator] }),
    };
    const form = this.formBuilder.group(formControls);
    return form;
  }
}
