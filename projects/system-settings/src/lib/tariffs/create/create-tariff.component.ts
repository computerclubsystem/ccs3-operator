import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { AbstractControl, Form, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { translate, TranslocoDirective } from '@jsverse/transloco';

import { IconName, NumericIdWithName } from '@ccs3-operator/shared/types';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Tariff } from '@ccs3-operator/messages';
import { CreateTariffService } from './create-tariff.service';
import { MessageTransportService } from '@ccs3-operator/shared';
import { createCreateTariffRequestMessage } from 'projects/messages/src/lib/create-tariff-request.message';
import { CreateTariffReplyMessage } from 'projects/messages/src/lib/create-tariff-reply.message';
import { NotificationsService, NotificationType } from '@ccs3-operator/notifications';

@Component({
  selector: 'ccs3-op-create-tariff',
  templateUrl: 'create-tariff.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatInputModule, MatSelectModule, MatFormFieldModule, MatButtonModule, MatCardModule,
    TranslocoDirective, MatCheckboxModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateTariffComponent implements OnInit {
  readonly tariffTypeDurationItem = { id: 1, name: translate('Duration') };
  readonly tariffTypeFromToItem = { id: 2, name: translate('From-To') };
  readonly tariffTypeItems = [this.tariffTypeDurationItem, this.tariffTypeFromToItem];
  readonly signals = this.createSignals();
  form!: FormGroup<FormControls>;

  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly createTariffSvc = inject(CreateTariffService);
  private readonly messageTransportSvc = inject(MessageTransportService);
  private readonly notificationsSvc = inject(NotificationsService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.form = this.createForm();
    this.subscribeToFormChanges();
    this.processTariffTypeChanges(this.form.controls.type.value);
  }

  onSave(): void {
    const requestMsg = createCreateTariffRequestMessage();
    requestMsg.body.tariff = this.createTariff();
    this.messageTransportSvc.sendAndAwaitForReplyByType(requestMsg)
      .subscribe(replyMsg => this.processCreateTariffReplyMessage(replyMsg));
  }

  processCreateTariffReplyMessage(createTariffReplyMsg: CreateTariffReplyMessage): void {
    if (createTariffReplyMsg.header.failure) {
      const errors = createTariffReplyMsg.header.errors?.map(x => `Error code ${x.code}: ${x.description}`);
      const errorsText = errors?.join(' ; ');
      this.notificationsSvc.show(NotificationType.error, translate(`Can't create tariff`), errorsText, IconName.error, createTariffReplyMsg);
    } else {
      this.notificationsSvc.show(NotificationType.success, translate('Tariff created'), null, IconName.check, createTariffReplyMsg);
    }
  }

  onCancel(): void {
    this.router.navigate(['../'], { relativeTo: this.activatedRoute });
  }

  createTariff(): Tariff {
    const formValue = this.form.value;
    const tariff = {
      name: formValue.name,
      type: formValue.type!.id,
      enabled: formValue.enabled,
      duration: this.createTariffSvc.convertDurationToNumber(formValue.duration!),
      price: formValue.price,
      description: formValue.description,
      fromTime: this.createTariffSvc.convertDurationToNumber(formValue.fromTime!),
      toTime: this.createTariffSvc.convertDurationToNumber(formValue.toTime!),
    } as Tariff;
    return tariff;
  }

  subscribeToFormChanges(): void {
    this.form.controls.type.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(tariffTypeItem => this.processTariffTypeChanges(tariffTypeItem));
    this.form.controls.duration.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(durationValue => this.processDurationValueChanges(durationValue));
    this.form.controls.price.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(priceValue => this.processPriceValueChanges(priceValue));
  }

  processDurationValueChanges(durationValue: string | null): void {
    const durationConrol = this.form.controls.duration;
    this.signals.durationHasNotTwoPartsError.set(durationConrol.hasError('notTwoParts'));
    this.signals.durationHasOutOfRangeError.set(durationConrol.hasError('outOfRange'));
    this.signals.durationHasInvalidCharError.set(durationConrol.hasError('invalidChar'));
  }

  processPriceValueChanges(priceValue: number | null): void {
    const priceControl = this.form.controls.price;
    this.signals.priceHasError.set(priceControl.invalid);
  }

  processTariffTypeChanges(tariffType: NumericIdWithName | null): void {
    const type = tariffType?.id;
    const showDuration = type === this.tariffTypeDurationItem.id;
    const showFromTo = type === this.tariffTypeFromToItem.id;
    this.signals.showDurationTypeSettings.set(showDuration);
    this.signals.showFromToTypeSettings.set(showFromTo);
    const controls = this.form.controls;
    if (showDuration) {
      controls.fromTime.removeValidators([durationValidator]);
      controls.toTime.removeValidators([durationValidator]);
      controls.duration.setValidators([durationValidator]);
    }
    if (showFromTo) {
      controls.fromTime.setValidators([durationValidator]);
      controls.toTime.setValidators([durationValidator]);
      controls.duration.removeValidators([durationValidator]);
    }
    controls.fromTime.updateValueAndValidity();
    controls.toTime.updateValueAndValidity();
    controls.duration.updateValueAndValidity();
  }

  createForm(): FormGroup<FormControls> {
    const formControls: FormControls = {
      name: new FormControl('', { validators: [Validators.required] }),
      description: new FormControl(),
      type: new FormControl(this.tariffTypeItems[0]),
      duration: new FormControl('', { validators: [durationValidator] }),
      fromTime: new FormControl(''),
      toTime: new FormControl(''),
      price: new FormControl(0, { validators: [priceValidator] }),
      enabled: new FormControl(true),
    };
    const form = this.formBuilder.group(formControls);
    return form;
  }

  createSignals(): Signals {
    const signals: Signals = {
      showDurationTypeSettings: signal(false),
      durationHasNotTwoPartsError: signal(false),
      durationHasOutOfRangeError: signal(false),
      durationHasInvalidCharError: signal(false),
      showFromToTypeSettings: signal(false),
      priceHasError: signal(false),
      priceHasMoreThanTwoFractionalDigitsError: signal(false),
    };
    return signals;
  }
}

interface FormControls {
  name: FormControl<string | null>;
  description: FormControl<string | null>;
  type: FormControl<NumericIdWithName | null>;
  duration: FormControl<string | null>;
  fromTime: FormControl<string | null>;
  toTime: FormControl<string | null>;
  price: FormControl<number | null>;
  enabled: FormControl<boolean | null>;
}

interface Signals {
  showDurationTypeSettings: WritableSignal<boolean>;
  durationHasNotTwoPartsError: WritableSignal<boolean>;
  durationHasOutOfRangeError: WritableSignal<boolean>;
  durationHasInvalidCharError: WritableSignal<boolean>;
  showFromToTypeSettings: WritableSignal<boolean>;
  priceHasError: WritableSignal<boolean>;
  priceHasMoreThanTwoFractionalDigitsError: WritableSignal<boolean>;
}

const durationValidator = (control: AbstractControl): ValidationErrors => {
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

const priceValidator = (control: AbstractControl): ValidationErrors => {
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
