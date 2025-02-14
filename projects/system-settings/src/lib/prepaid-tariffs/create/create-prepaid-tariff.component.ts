import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal
} from '@angular/core';
import {
  AbstractControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { translate, TranslocoDirective } from '@jsverse/transloco';

import {
  HashService, InternalSubjectsService, MessageTransportService, NotificationType, TimeConverterService,
  ValidatorsService
} from '@ccs3-operator/shared';
import { SecondsFormatterComponent, SecondsFormatterService } from '@ccs3-operator/seconds-formatter';
import {
  createCreatePrepaidTariffRequestMessage, createGetTariffByIdRequestMessage,
  createRechargeTariffDurationRequestMessage, CreatePrepaidTariffReplyMessage,
  createUpdateTariffRequestMessage, GetTariffByIdReplyMessage, RechargeTariffDurationReplyMessage,
  Tariff, TariffType, UpdateTariffReplyMessage
} from '@ccs3-operator/messages';
import { NotificationsService } from '@ccs3-operator/notifications';
import { IconName } from '@ccs3-operator/shared/types';
import { DurationFormControls, FormControls, Signals } from './declarations';
import { CreatePrepaidTariffService } from './create-prepaid-tariff.service';

@Component({
  selector: 'ccs3-op-system-settings-create-prepaid-tariff',
  templateUrl: 'create-prepaid-tariff.component.html',
  imports: [
    ReactiveFormsModule, MatInputModule, MatSelectModule, MatFormFieldModule, MatButtonModule, MatCardModule,
    TranslocoDirective, MatCheckboxModule, SecondsFormatterComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatePrepaidTariffComponent implements OnInit {
  signals = this.createSignals();
  form!: FormGroup<FormControls>;

  private readonly secondsFormatterSvc = inject(SecondsFormatterService);
  private readonly createPrepaidTariffSvc = inject(CreatePrepaidTariffService);
  private readonly timeConverterSvc = inject(TimeConverterService);
  private readonly internalSubjectsSvc = inject(InternalSubjectsService);
  private readonly messageTransportSvc = inject(MessageTransportService);
  private readonly notificationsSvc = inject(NotificationsService);
  private readonly validatorsSvc = inject(ValidatorsService);
  private readonly hashSvc = inject(HashService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.form = this.createPrepaidTariffSvc.createForm();
    this.subscribeToFormChanges();
    const tariffId = this.activatedRoute.snapshot.paramMap.get('tariffId');
    this.signals.isCreate.set(!tariffId);
    if (tariffId) {
      this.form.patchValue({
        setPassword: false,
      });
      this.loadTariff(+tariffId);
    } else {
      this.form.patchValue({
        setPassword: true,
      });
    }
  }

  subscribeToFormChanges(): void {
    this.form.controls.durationGroup.controls.duration.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.processDurationValueChanges());
    this.form.controls.price.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.processPriceValueChanges());
    this.form.controls.setPassword.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(setPasswordValue => this.processSetPasswordValueChanged(setPasswordValue!));
  }

  processSetPasswordValueChanged(setPasswordValue: boolean): void {
    this.signals.showPasswords.set(setPasswordValue);
    if (setPasswordValue) {
      this.form.setValidators([this.samePasswordValidator]);
      this.form.controls.password.setValidators([Validators.required, this.validatorsSvc.noWhiteSpace]);
      this.form.controls.confirmPassword.setValidators([Validators.required, this.validatorsSvc.noWhiteSpace]);
    } else {
      this.form.removeValidators(this.samePasswordValidator);
      this.form.controls.password.clearValidators();
      this.form.controls.password.setErrors(null);
      this.form.controls.confirmPassword.clearValidators();
      this.form.controls.confirmPassword.setErrors(null);
    }
  }

  samePasswordValidator(control: AbstractControl): ValidationErrors | null {
    const form = control as FormGroup<FormControls>;
    const formValue = form.getRawValue();
    const passwordValue = formValue.password;
    const confirmPasswordValue = formValue.confirmPassword;
    const isWhiteSpace = (string?: string | null): boolean => !(string?.trim());
    if (!isWhiteSpace(passwordValue) && !isWhiteSpace(confirmPasswordValue) && passwordValue === confirmPasswordValue) {
      form.controls.password.setErrors(null);
      form.controls.confirmPassword.setErrors(null);
    } else {
      form.controls.password.setErrors({ notEqual: true });
      form.controls.confirmPassword.setErrors({ notEqual: true });
    }

    return null;
  }

  hasPasswordsNotEqualError(): boolean {
    if (!this.form.getRawValue().setPassword) {
      return false;
    }
    const notEqualErrorName = 'notEqual';
    return this.form.controls.password.hasError(notEqualErrorName)
      || this.form.controls.confirmPassword.hasError(notEqualErrorName);
  }

  loadTariff(tariffId: number): void {
    this.signals.isLoading.set(true);
    this.internalSubjectsSvc.whenSignedIn().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.processLoadTariff(tariffId));
  }

  processLoadTariff(tariffId: number): void {
    const getTariffRequestMsg = createGetTariffByIdRequestMessage();
    getTariffRequestMsg.body.tariffId = tariffId;
    this.messageTransportSvc.sendAndAwaitForReply(getTariffRequestMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(getTariffByIdReplyMsg => this.processGetTariffByIdReplyMessage(getTariffByIdReplyMsg as GetTariffByIdReplyMessage));
  }

  processGetTariffByIdReplyMessage(getTariffByIdReplyMsg: GetTariffByIdReplyMessage): void {
    if (getTariffByIdReplyMsg.header.failure) {
      return;
    }

    this.applyTariffToTheForm(getTariffByIdReplyMsg.body.tariff!);
  }

  applyTariffToTheForm(tariff: Tariff): void {
    // Apply tariff to the form
    this.signals.tariff.set(tariff);
    const durationText = this.timeConverterSvc.convertMinutesToTime(tariff.duration);
    this.form.patchValue({
      description: tariff.description,
      enabled: tariff.enabled,
      name: tariff.name,
      price: tariff.price,
      durationGroup: {
        duration: durationText,
      },
      canBeStartedByCustomer: tariff.canBeStartedByCustomer,
    });
    this.signals.initialDuration.set(durationText);
    this.signals.initialPrice.set(tariff.price);
    this.signals.isLoading.set(false);
  }

  processDurationValueChanges(): void {
    const durationConrol = this.form.controls.durationGroup.controls.duration;
    this.signals.durationHasNotTwoPartsError.set(durationConrol.hasError('notTwoParts'));
    this.signals.durationHasOutOfRangeError.set(durationConrol.hasError('outOfRange'));
    this.signals.durationHasInvalidCharError.set(durationConrol.hasError('invalidChar'));
  }

  processPriceValueChanges(): void {
    const priceControl = this.form.controls.price;
    this.signals.priceHasError.set(priceControl.invalid);
  }

  onRecharge(): void {
    const requestMsg = createRechargeTariffDurationRequestMessage();
    requestMsg.body.tariffId = this.signals.tariff()!.id;
    this.messageTransportSvc.sendAndAwaitForReply(requestMsg).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(replyMsg => this.processRechargeTariffDurationReplyMessage(replyMsg as RechargeTariffDurationReplyMessage));
  }

  processRechargeTariffDurationReplyMessage(replyMsg: RechargeTariffDurationReplyMessage): void {
    if (!replyMsg.header.failure) {
      const tariff = this.signals.tariff();
      tariff!.remainingSeconds = replyMsg.body.remainingSeconds;
      this.signals.tariff.set(tariff);
      const remainingSecondsComputedValue = this.secondsFormatterSvc.getComputedValue(replyMsg.body.remainingSeconds);
      const remainingTimeString = this.secondsFormatterSvc.computedValueResultToSring(remainingSecondsComputedValue);
      this.notificationsSvc.show(
        NotificationType.success,
        translate('Tariff recharged'),
        translate('New remaining time {{remainingTime}}', { remainingTime: remainingTimeString }),
        IconName.check,
        replyMsg
      );
      this.changeDetectorRef.markForCheck();
      return;
    }
  }

  async onSave(): Promise<void> {
    const formRawValue = this.form.getRawValue();
    const tariff = this.signals.tariff();
    if (tariff) {
      // Update tariff
      const requestMsg = createUpdateTariffRequestMessage();
      requestMsg.body.tariff = this.createPrepaidTariff();
      requestMsg.body.tariff.id = tariff.id;
      if (formRawValue.setPassword) {
        requestMsg.body.passwordHash = await this.hashSvc.getSha512(formRawValue.password!);
      }
      this.messageTransportSvc.sendAndAwaitForReply(requestMsg).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(replyMsg => this.processUpdateTariffReplyMessage(replyMsg as UpdateTariffReplyMessage));
    } else {
      this.signals.createdTariff.set(null);
      const requestMsg = createCreatePrepaidTariffRequestMessage();
      requestMsg.body.tariff = this.createPrepaidTariff();
      if (formRawValue.setPassword) {
        requestMsg.body.passwordHash = await this.hashSvc.getSha512(formRawValue.password!);
      }
      this.messageTransportSvc.sendAndAwaitForReply(requestMsg).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(replyMsg => this.processCreatePrepaidTariffReplyMessage(replyMsg as CreatePrepaidTariffReplyMessage));
    }
  }

  processUpdateTariffReplyMessage(updateTariffReplyMsg: UpdateTariffReplyMessage): void {
    if (!updateTariffReplyMsg.header.failure) {
      this.notificationsSvc.show(NotificationType.success, translate('Tariff updated'), null, IconName.check, updateTariffReplyMsg);
      const tariff = updateTariffReplyMsg.body.tariff!;
      this.applyTariffToTheForm(tariff);
    }
  }

  processCreatePrepaidTariffReplyMessage(createPrepaidTariffReplyMsg: CreatePrepaidTariffReplyMessage): void {
    if (!createPrepaidTariffReplyMsg.header.failure) {
      this.notificationsSvc.show(NotificationType.success, translate('Tariff with ID {{id}} created', { id: createPrepaidTariffReplyMsg.body.tariff.id }), null, IconName.check, createPrepaidTariffReplyMsg);
      this.signals.createdTariff.set(createPrepaidTariffReplyMsg.body.tariff);
    }
  }

  onGoToList(): void {
    if (this.signals.tariff()) {
      // We are in edit mode - go back more steps
      this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
    } else {
      // We are in create mode
      this.router.navigate(['../'], { relativeTo: this.activatedRoute });
    }
  }

  getDurationFormControls(): DurationFormControls {
    return this.form.controls.durationGroup.controls;
  }

  createPrepaidTariff(): Tariff {
    const formValue = this.form.getRawValue();
    const tariffDuration = this.timeConverterSvc.convertTimeToMinutes(formValue.durationGroup!.duration!);
    const tariff = {
      name: formValue.name!,
      type: TariffType.prepaid,
      enabled: !!formValue.enabled,
      duration: tariffDuration,
      price: formValue.price!,
      description: formValue.description,
      canBeStartedByCustomer: formValue.canBeStartedByCustomer,
    } as Tariff;
    return tariff;
  }

  createSignals(): Signals {
    const signals: Signals = {
      durationHasNotTwoPartsError: signal(false),
      durationHasOutOfRangeError: signal(false),
      durationHasInvalidCharError: signal(false),
      priceHasError: signal(false),
      priceHasMoreThanTwoFractionalDigitsError: signal(false),
      isCreate: signal(true),
      isLoading: signal(false),
      tariff: signal(null),
      createdTariff: signal(null),
      showPasswords: signal(false),
      initialDuration: signal(null),
      initialPrice: signal(null),
    };
    return signals;
  }
}
