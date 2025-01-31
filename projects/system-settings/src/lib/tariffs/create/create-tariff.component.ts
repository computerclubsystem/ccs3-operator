import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { translate, TranslocoDirective } from '@jsverse/transloco';

import { IconName, NumericIdWithName } from '@ccs3-operator/shared/types';
import {
  createCreateTariffRequestMessage, createGetTariffByIdRequestMessage, CreateTariffReplyMessage,
  createUpdateTariffRequestMessage, GetTariffByIdReplyMessage, Tariff, TariffType, UpdateTariffReplyMessage
} from '@ccs3-operator/messages';
import { InternalSubjectsService, MessageTransportService, NotificationType, TimeConverterService } from '@ccs3-operator/shared';
import { NotificationsService } from '@ccs3-operator/notifications';
import { CreateTariffService } from './create-tariff.service';
import { DurationFormControls, FormControls, FromToFormControls, Signals } from './declarations';

@Component({
  selector: 'ccs3-op-system-settings-create-tariff',
  templateUrl: 'create-tariff.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatInputModule, MatSelectModule, MatFormFieldModule, MatButtonModule, MatCardModule,
    TranslocoDirective, MatCheckboxModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateTariffComponent implements OnInit {
  readonly signals = this.createSignals();
  private readonly createTariffSvc = inject(CreateTariffService);
  readonly tariffTypeItems = this.createTariffSvc.tariffTypeItems;
  form!: FormGroup<FormControls>;

  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly timeConverterSvc = inject(TimeConverterService);
  private readonly messageTransportSvc = inject(MessageTransportService);
  private readonly notificationsSvc = inject(NotificationsService);
  private readonly internalSubjectsSvc = inject(InternalSubjectsService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.form = this.createTariffSvc.createForm();
    this.subscribeToFormChanges();
    this.processTariffTypeItemChanges(this.form.controls.type.value);
    const tariffId = this.activatedRoute.snapshot.paramMap.get('tariffId');
    this.signals.isCreate.set(!tariffId);
    if (tariffId) {
      this.loadTariff(+tariffId);
    }
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
    ).subscribe(getTariffByIdReplyMsg => this.processGetTariffByIdReplyMessage(getTariffByIdReplyMsg));
  }

  processGetTariffByIdReplyMessage(getTariffByIdReplyMsg: GetTariffByIdReplyMessage): void {
    if (getTariffByIdReplyMsg.header.failure) {
      return;
    }

    // Apply tariff to the form
    const tariff = getTariffByIdReplyMsg.body.tariff!;
    this.signals.tariff.set(tariff);
    this.form.patchValue({
      description: tariff.description,
      enabled: tariff.enabled,
      name: tariff.name,
      price: tariff.price,
      type: this.tariffTypeItems.find(x => x.id === tariff.type),
      durationTypeGroup: {
        duration: this.timeConverterSvc.convertMinutesToTime(tariff.duration),
        restrictStart: tariff.restrictStartTime,
        restrictStartFromTime: this.timeConverterSvc.convertMinutesToTime(tariff.restrictStartFromTime),
        restrictStartToTime: this.timeConverterSvc.convertMinutesToTime(tariff.restrictStartToTime),
      },
      fromToTypeGroup: {
        fromTime: this.timeConverterSvc.convertMinutesToTime(tariff.fromTime),
        toTime: this.timeConverterSvc.convertMinutesToTime(tariff.toTime),
      }
    });
    this.signals.isLoading.set(false);
  }

  onSave(): void {
    const tariff = this.signals.tariff();
    if (tariff) {
      // Update tariff
      const requestMsg = createUpdateTariffRequestMessage();
      requestMsg.body.tariff = this.createTariff();
      requestMsg.body.tariff.id = tariff.id;
      this.messageTransportSvc.sendAndAwaitForReply(requestMsg).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(replyMsg => this.processUpdateTariffReplyMessage(replyMsg));
    } else {
      const requestMsg = createCreateTariffRequestMessage();
      requestMsg.body.tariff = this.createTariff();
      this.messageTransportSvc.sendAndAwaitForReply(requestMsg).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(replyMsg => this.processCreateTariffReplyMessage(replyMsg));
    }
  }

  processUpdateTariffReplyMessage(updateTariffReplyMsg: UpdateTariffReplyMessage): void {
    if (!updateTariffReplyMsg.header.failure) {
      this.notificationsSvc.show(NotificationType.success, translate('Tariff updated'), null, IconName.check, updateTariffReplyMsg);
    }
  }

  processCreateTariffReplyMessage(createTariffReplyMsg: CreateTariffReplyMessage): void {
    if (!createTariffReplyMsg.header.failure) {
      this.notificationsSvc.show(NotificationType.success, translate('Tariff created'), null, IconName.check, createTariffReplyMsg);
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

  createTariff(): Tariff {
    const formValue = this.form.value;
    const isDuration = formValue.type?.id === TariffType.duration;
    const isFromTo = formValue.type?.id === TariffType.fromTo;
    const tariffDuration = isDuration ? this.timeConverterSvc.convertTimeToMinutes(formValue.durationTypeGroup!.duration!) : null;
    const restrictStartTime = isDuration ? formValue.durationTypeGroup?.restrictStart : null;
    const restrictStartFromTime = (isDuration && restrictStartTime) ? this.timeConverterSvc.convertTimeToMinutes(formValue.durationTypeGroup!.restrictStartFromTime!) : null;
    const restrictStartToTime = (isDuration && restrictStartTime) ? this.timeConverterSvc.convertTimeToMinutes(formValue.durationTypeGroup!.restrictStartToTime!) : null;
    const tariffFromTime = isFromTo ? this.timeConverterSvc.convertTimeToMinutes(formValue.fromToTypeGroup?.fromTime!) : null;
    const tariffToTime = isFromTo ? this.timeConverterSvc.convertTimeToMinutes(formValue.fromToTypeGroup?.toTime!) : null;
    const tariff = {
      name: formValue.name!,
      type: formValue.type!.id,
      enabled: !!formValue.enabled,
      duration: tariffDuration,
      restrictStartTime: restrictStartTime,
      restrictStartFromTime: restrictStartFromTime,
      restrictStartToTime: restrictStartToTime,
      price: formValue.price!,
      description: formValue.description,
      fromTime: tariffFromTime,
      toTime: tariffToTime,
    } as Tariff;
    return tariff;
  }

  subscribeToFormChanges(): void {
    this.form.controls.type.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(tariffTypeItem => this.processTariffTypeItemChanges(tariffTypeItem));
    this.form.controls.durationTypeGroup.controls.duration.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(durationValue => this.processDurationValueChanges(durationValue));
    this.form.controls.price.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(priceValue => this.processPriceValueChanges(priceValue));
    this.form.controls.durationTypeGroup.controls.restrictStart.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(restrictStartValue => this.processRestrictDurationStartChanges(restrictStartValue));
  }

  processRestrictDurationStartChanges(restrictStartValue: boolean | null): void {
    const showRestrictStartSettings = !!restrictStartValue;
    this.signals.showRestrictStartPeriodSettings.set(showRestrictStartSettings);
    this.createTariffSvc.modifyDurationGroupValidators(this.form.controls.durationTypeGroup.controls, this.form.value.type?.id!);
  }

  processDurationValueChanges(durationValue: string | null): void {
    const durationConrol = this.form.controls.durationTypeGroup.controls.duration;
    this.signals.durationHasNotTwoPartsError.set(durationConrol.hasError('notTwoParts'));
    this.signals.durationHasOutOfRangeError.set(durationConrol.hasError('outOfRange'));
    this.signals.durationHasInvalidCharError.set(durationConrol.hasError('invalidChar'));
  }

  processPriceValueChanges(priceValue: number | null): void {
    const priceControl = this.form.controls.price;
    this.signals.priceHasError.set(priceControl.invalid);
  }

  processTariffTypeItemChanges(tariffTypeItem: NumericIdWithName | null): void {
    const tariffType = tariffTypeItem?.id!;
    const showDuration = tariffType === this.createTariffSvc.tariffTypeDurationItem.id;
    const showFromTo = tariffType === this.createTariffSvc.tariffTypeFromToItem.id;
    this.signals.showDurationTypeSettings.set(showDuration);
    this.signals.showFromToTypeSettings.set(showFromTo);

    this.createTariffSvc.modifyDurationGroupValidators(this.form.controls.durationTypeGroup.controls, tariffType);
    this.createTariffSvc.modifyFromToGroupValidators(this.form.controls.fromToTypeGroup.controls, tariffType);
  }

  getDurationFormControls(): DurationFormControls {
    return this.form.controls.durationTypeGroup.controls;
  }

  getFromToFormControls(): FromToFormControls {
    return this.form.controls.fromToTypeGroup.controls;
  }

  createSignals(): Signals {
    const signals: Signals = {
      showDurationTypeSettings: signal(false),
      durationHasNotTwoPartsError: signal(false),
      durationHasOutOfRangeError: signal(false),
      durationHasInvalidCharError: signal(false),
      showFromToTypeSettings: signal(false),
      showRestrictStartPeriodSettings: signal(false),
      priceHasError: signal(false),
      priceHasMoreThanTwoFractionalDigitsError: signal(false),
      isCreate: signal(true),
      isLoading: signal(false),
      tariff: signal(null),
    };
    return signals;
  }
}
