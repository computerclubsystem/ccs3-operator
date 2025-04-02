import { inject, Injectable } from '@angular/core';
import {
  FormBuilder, FormControl, FormGroup, ValidatorFn, Validators
} from '@angular/forms';

import { ValidatorsService } from '@ccs3-operator/shared';
import { DurationFormControls, FormControls } from './declarations';

@Injectable({ providedIn: 'root' })
export class CreatePrepaidTariffService {
  private readonly validatorsSvc = inject(ValidatorsService);
  private readonly formBuilder = inject(FormBuilder);

  modifyDurationGroupValidators(durationControls: DurationFormControls): void {
    const validators: ValidatorFn[] = [Validators.required, this.validatorsSvc.durationValidator];
    durationControls.duration.setValidators(validators);
    durationControls.duration.updateValueAndValidity();
  }

  createForm(minPasswordLength: number): FormGroup<FormControls> {
    const durationTypeControls: DurationFormControls = {
      duration: new FormControl('', { validators: [Validators.required, this.validatorsSvc.durationValidator] }),
    };
    const formControls: FormControls = {
      name: new FormControl('', { validators: [Validators.required] }),
      description: new FormControl(),
      enabled: new FormControl(true),
      durationGroup: this.formBuilder.group(durationTypeControls),
      price: new FormControl(0, { validators: [Validators.required, this.validatorsSvc.priceValidator] }),
      canBeStartedByCustomer: new FormControl(false),
      setPassword: new FormControl(true),
      password: new FormControl(null, { validators: [Validators.required, Validators.minLength(minPasswordLength)] }),
      confirmPassword: new FormControl(null, { validators: [Validators.required, Validators.minLength(minPasswordLength)] }),
    };
    const form = this.formBuilder.group(formControls);
    return form;
  }
}
