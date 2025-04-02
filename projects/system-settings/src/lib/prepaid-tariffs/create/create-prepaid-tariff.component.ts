import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal
} from '@angular/core';
import {
  AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { translate, TranslocoDirective } from '@jsverse/transloco';
import { forkJoin, Observable } from 'rxjs';

import {
  HashService, InternalSubjectsService, MessageTransportService, NotificationType, SorterService, TimeConverterService,
  ValidatorsService
} from '@ccs3-operator/shared';
import { SecondsFormatterComponent, SecondsFormatterService } from '@ccs3-operator/seconds-formatter';
import {
  createCreatePrepaidTariffRequestMessage, createGetTariffByIdRequestMessage,
  createRechargeTariffDurationRequestMessage, CreatePrepaidTariffReplyMessage,
  createUpdateTariffRequestMessage, GetTariffByIdReplyMessage, RechargeTariffDurationReplyMessage,
  Tariff, TariffType, UpdateTariffReplyMessage, DeviceGroup, createGetAllDeviceGroupsRequestMessage,
  createGetTariffDeviceGroupsRequestMessage, Message, ReplyMessage, GetTariffDeviceGroupsReplyMessage,
  GetAllDeviceGroupsReplyMessage
} from '@ccs3-operator/messages';
import { NotificationsService } from '@ccs3-operator/notifications';
import { IconName } from '@ccs3-operator/shared/types';
import { DurationFormControls, FormControls, Signals } from './declarations';
import { CreatePrepaidTariffService } from './create-prepaid-tariff.service';
import { LinkedListsComponent } from '@ccs3-operator/linked-lists';

@Component({
  selector: 'ccs3-op-system-settings-create-prepaid-tariff',
  templateUrl: 'create-prepaid-tariff.component.html',
  imports: [
    ReactiveFormsModule, MatInputModule, MatSelectModule, MatFormFieldModule, MatButtonModule, MatCardModule,
    TranslocoDirective, MatCheckboxModule, MatDividerModule, MatIconModule, SecondsFormatterComponent, LinkedListsComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatePrepaidTariffComponent implements OnInit {
  readonly minPasswordLength = 10;

  signals = this.createSignals();
  form!: FormGroup<FormControls>;
  iconName = IconName;

  private readonly secondsFormatterSvc = inject(SecondsFormatterService);
  private readonly createPrepaidTariffSvc = inject(CreatePrepaidTariffService);
  private readonly timeConverterSvc = inject(TimeConverterService);
  private readonly internalSubjectsSvc = inject(InternalSubjectsService);
  private readonly messageTransportSvc = inject(MessageTransportService);
  private readonly notificationsSvc = inject(NotificationsService);
  private readonly validatorsSvc = inject(ValidatorsService);
  private readonly hashSvc = inject(HashService);
  private readonly sorterSvc = inject(SorterService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.form = this.createPrepaidTariffSvc.createForm(this.minPasswordLength);
    this.subscribeToFormChanges();
    this.internalSubjectsSvc.whenSignedIn().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.init());
  }

  init(): void {
    const tariffId = this.activatedRoute.snapshot.paramMap.get('tariffId');
    this.signals.isCreate.set(!tariffId);
    if (tariffId) {
      this.form.patchValue({
        setPassword: false,
      });
      this.loadTariffData(+tariffId);
    } else {
      this.form.patchValue({
        setPassword: true,
      });
      this.loadNewTariffData();
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
      this.form.controls.password.setValidators([Validators.required, Validators.minLength(this.minPasswordLength), this.validatorsSvc.noWhiteSpace]);
      this.form.controls.confirmPassword.setValidators([Validators.required, Validators.minLength(this.minPasswordLength), this.validatorsSvc.noWhiteSpace]);
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
    const areEqual = !isWhiteSpace(passwordValue) && !isWhiteSpace(confirmPasswordValue) && passwordValue === confirmPasswordValue;
    const removeFormControlError = (control: FormControl, errorName: string): void => {
      const currentErrors = control.errors;
      delete currentErrors?.[errorName];
      if (currentErrors) {
        if (Object.keys(currentErrors).length > 0) {
          control.setErrors(currentErrors);
        } else {
          control.setErrors(null);
        }
      }
    };
    if (areEqual) {
      removeFormControlError(form.controls.password, FormControlErrorName.notEqual);
      removeFormControlError(form.controls.confirmPassword, FormControlErrorName.notEqual);
    } else {
      const notEqualControlError: NotEqualFormValidationError = { notEqual: true };
      form.controls.password.setErrors({ ...form.controls.password.errors, ...notEqualControlError });
      form.controls.confirmPassword.setErrors({ ...form.controls.confirmPassword.errors, ...notEqualControlError });
    }

    return null;
  }

  hasPasswordsNotEqualError(): boolean {
    if (!this.form.getRawValue().setPassword) {
      return false;
    }
    return this.form.controls.password.hasError(FormControlErrorName.notEqual)
      || this.form.controls.confirmPassword.hasError(FormControlErrorName.notEqual);
  }

  hasMinLengthError(control: FormControl): boolean {
    return control.hasError(FormControlErrorName.minlength);
  }

  loadNewTariffData(): void {
    this.signals.isLoading.set(true);
    const getAllDeviceGroupsRequestMsg = createGetAllDeviceGroupsRequestMessage();
    this.messageTransportSvc.sendAndAwaitForReply(getAllDeviceGroupsRequestMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(replyMsg => this.processNewTariffDataLoaded(replyMsg as GetAllDeviceGroupsReplyMessage));
  }

  processNewTariffDataLoaded(getAllDeviceGroupsReplyMsg: GetAllDeviceGroupsReplyMessage): void {
    if (getAllDeviceGroupsReplyMsg.header.failure) {
      return;
    }
    this.signals.isLoading.set(false);

    this.signals.tariffDeviceGroups.set([]);
    this.sorterSvc.sortBy(getAllDeviceGroupsReplyMsg.body.deviceGroups, x => x.name);
    this.signals.availableDeviceGroups.set(getAllDeviceGroupsReplyMsg.body.deviceGroups);
  }

  loadTariffData(tariffId: number): void {
    this.signals.isLoading.set(true);
    const getTariffRequestMsg = createGetTariffByIdRequestMessage();
    getTariffRequestMsg.body.tariffId = tariffId;
    const getTariffDeviceGroupsReqMsg = createGetTariffDeviceGroupsRequestMessage();
    getTariffDeviceGroupsReqMsg.body.tariffId = tariffId;
    const getAllDeviceGroupsRequestMsg = createGetAllDeviceGroupsRequestMessage();
    const observables: LoadDataObservablesObject = {
      tariff: this.messageTransportSvc.sendAndAwaitForReply(getTariffRequestMsg),
      tariffDeviceGroups: this.messageTransportSvc.sendAndAwaitForReply(getTariffDeviceGroupsReqMsg),
      allDeviceGroups: this.messageTransportSvc.sendAndAwaitForReply(getAllDeviceGroupsRequestMsg),
    };
    forkJoin(observables).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(replyMessages => this.processTariffDataLoaded(replyMessages as LoadDataMessagesObject));
  }

  processTariffDataLoaded(replyMessages: LoadDataMessagesObject): void {
    if (replyMessages.allDeviceGroups?.header.failure
      || replyMessages.tariff?.header.failure
      || replyMessages.tariffDeviceGroups?.header.failure
    ) {
      return;
    }
    this.signals.isLoading.set(false);

    const deviceGroupsMap = new Map<number, DeviceGroup>(replyMessages.allDeviceGroups.body.deviceGroups.map(x => ([x.id, x])));
    const tariffDeviceGroupsMap = new Map<number, DeviceGroup>();
    const availableDeviceGroupsMap = new Map<number, DeviceGroup>();
    for (const tariffDeviceGroupId of replyMessages.tariffDeviceGroups.body.deviceGroupIds) {
      const deviceGroup = deviceGroupsMap.get(tariffDeviceGroupId)!;
      tariffDeviceGroupsMap.set(tariffDeviceGroupId, deviceGroup);
    }
    for (const deviceGroupMapItem of deviceGroupsMap) {
      if (!tariffDeviceGroupsMap.has(deviceGroupMapItem[0])) {
        availableDeviceGroupsMap.set(deviceGroupMapItem[0], deviceGroupMapItem[1]);
      }
    }

    const tariffDeviceGroups = Array.from(tariffDeviceGroupsMap.values());
    this.sorterSvc.sortBy(tariffDeviceGroups, x => x.name);
    this.signals.tariffDeviceGroups.set(tariffDeviceGroups);
    const availableDeviceGroups = Array.from(availableDeviceGroupsMap.values());
    this.sorterSvc.sortBy(availableDeviceGroups, x => x.name);
    this.signals.availableDeviceGroups.set(availableDeviceGroups);
    this.applyTariffToTheForm(replyMessages.tariff.body.tariff!);
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
      const remainingTimeString = this.secondsFormatterSvc.computedValueResultToString(remainingSecondsComputedValue);
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
      requestMsg.body.deviceGroupIds = this.signals.tariffDeviceGroups().map(x => x.id);
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
      requestMsg.body.deviceGroupIds = this.signals.tariffDeviceGroups().map(x => x.id);
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

  // onAddToDeviceGroup(deviceGroup: DeviceGroup): void {
  //   const availableDeviceGroups = this.signals.availableDeviceGroups();
  //   const tariffDeviceGroups = this.signals.tariffDeviceGroups();
  //   const selectedTariffIndex = availableDeviceGroups.indexOf(deviceGroup);
  //   tariffDeviceGroups.push(deviceGroup);
  //   availableDeviceGroups.splice(selectedTariffIndex, 1);
  //   this.signals.availableDeviceGroups.set(availableDeviceGroups);
  //   this.signals.tariffDeviceGroups.set(tariffDeviceGroups);
  // }

  // onRemoveFromDeviceGroup(deviceGroup: DeviceGroup): void {
  //   const tariffDeviceGroups = this.signals.tariffDeviceGroups();
  //   const availableDeviceGroups = this.signals.availableDeviceGroups();
  //   const selectedDeviceGroupIndex = tariffDeviceGroups.indexOf(deviceGroup);
  //   availableDeviceGroups.push(deviceGroup);
  //   tariffDeviceGroups.splice(selectedDeviceGroupIndex, 1);
  //   this.signals.availableDeviceGroups.set(availableDeviceGroups);
  //   this.signals.tariffDeviceGroups.set(tariffDeviceGroups);
  // }

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
      availableDeviceGroups: signal([]),
      tariffDeviceGroups: signal([]),
    };
    return signals;
  }
}

interface LoadDataObservablesObject extends Record<string, Observable<Message<unknown>>> {
  tariff: Observable<Message<unknown>>;
  tariffDeviceGroups: Observable<Message<unknown>>;
  allDeviceGroups: Observable<Message<unknown>>;
}

interface LoadDataMessagesObject extends Record<string, ReplyMessage<unknown>> {
  tariff: GetTariffByIdReplyMessage;
  tariffDeviceGroups: GetTariffDeviceGroupsReplyMessage;
  allDeviceGroups: GetAllDeviceGroupsReplyMessage;
}

const enum FormControlErrorName {
  notEqual = 'notEqual',
  minlength = 'minlength',
}
interface NotEqualFormValidationError {
  [FormControlErrorName.notEqual]: boolean;
}
