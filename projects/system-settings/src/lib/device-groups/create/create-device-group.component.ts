import {
  ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, WritableSignal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { translate, TranslocoDirective } from '@jsverse/transloco';
import { forkJoin, Observable, of } from 'rxjs';

import {
  createCreateDeviceGroupRequestMessage,
  CreateDeviceGroupReplyMessage,
  createGetAllDevicesRequestMessage, createGetAllTariffsRequestMessage,
  createGetDeviceGroupDataRequestMessage, createUpdateDeviceGroupRequestMessage, Device, DeviceGroup, GetAllDevicesReplyMessage,
  GetAllTariffsReplyMessage, GetDeviceGroupDataReplyMessage, Tariff,
  UpdateDeviceGroupReplyMessage
} from '@ccs3-operator/messages';
import { InternalSubjectsService, MessageTransportService, NotificationType, SorterService } from '@ccs3-operator/shared';
import { IconName } from '@ccs3-operator/shared/types';
import { NotificationsService } from '@ccs3-operator/notifications';

@Component({
  selector: 'ccs3-op-system-settings-create-device-group',
  templateUrl: 'create-device-group.component.html',
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatCardModule, MatButtonModule,
    MatIconModule, MatDivider, TranslocoDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateDeviceGroupComponent implements OnInit {
  readonly iconName = IconName;
  readonly signals = this.createSignals();
  private readonly formBuilder = inject(FormBuilder);
  readonly form = this.createForm();
  private readonly internalSubjectsSvc = inject(InternalSubjectsService);
  private readonly messageTransportSvc = inject(MessageTransportService);
  private readonly notificationsSvc = inject(NotificationsService);
  private readonly sorterSvc = inject(SorterService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private deviceGroupId?: number | null;

  ngOnInit(): void {
    this.deviceGroupId = +this.activatedRoute.snapshot.paramMap.get('deviceGroupId')!;
    this.internalSubjectsSvc.whenSignedIn().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.init());
  }

  init(): void {
    this.signals.isCreate.set(!this.deviceGroupId);
    this.loadObjects();
  }

  loadObjects(): void {
    const observables: Observable<unknown>[] = [];
    if (this.deviceGroupId) {
      const getDeviceGroupDataReqMsg = createGetDeviceGroupDataRequestMessage();
      getDeviceGroupDataReqMsg.body.deviceGroupId = this.deviceGroupId;
      const getDeviceGroupData$ = this.messageTransportSvc.sendAndAwaitForReply(getDeviceGroupDataReqMsg);
      const getAllDevicesReqMsg = createGetAllDevicesRequestMessage();
      const allDevices$ = this.messageTransportSvc.sendAndAwaitForReply(getAllDevicesReqMsg);
      observables.push(getDeviceGroupData$);
      observables.push(allDevices$);
    } else {
      observables.push(of(null));
      observables.push(of(null));
    }
    const getAllTariffsReqMsg = createGetAllTariffsRequestMessage();
    const getAllTariffs$ = this.messageTransportSvc.sendAndAwaitForReply(getAllTariffsReqMsg);
    observables.push(getAllTariffs$);
    this.signals.isLoading.set(true);
    forkJoin(observables).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(([getDeviceGroupDataReplyMsg, allDevicesReplyMsg, allTariffsReplyMsg]) =>
      this.processLoadObjectsReplies(
        getDeviceGroupDataReplyMsg as GetDeviceGroupDataReplyMessage | null,
        allDevicesReplyMsg as GetAllDevicesReplyMessage | null,
        allTariffsReplyMsg as GetAllTariffsReplyMessage,
      ));
  }

  processLoadObjectsReplies(
    getDeviceGroupDataReplyMsg: GetDeviceGroupDataReplyMessage | null,
    allDevicesReplyMsg: GetAllDevicesReplyMessage | null,
    tariffsReplyMsg: GetAllTariffsReplyMessage,
  ): void {
    this.signals.isLoading.set(false);
    if (getDeviceGroupDataReplyMsg?.header.failure
      || allDevicesReplyMsg?.header.failure
      || tariffsReplyMsg.header.failure
    ) {
      return;
    }
    this.sorterSvc.sortBy(tariffsReplyMsg.body.tariffs, x => x.name);
    if (allDevicesReplyMsg && getDeviceGroupDataReplyMsg?.body.deviceGroupData) {
      // This is existing device group
      const groupData = getDeviceGroupDataReplyMsg.body.deviceGroupData;
      this.signals.deviceGroup.set(groupData.deviceGroup);
      this.form.patchValue({
        description: groupData.deviceGroup.description,
        name: groupData.deviceGroup.name,
        restrictDeviceTransfers: groupData.deviceGroup.restrictDeviceTransfers,
      });
      const deviceIdsInGroupSet = new Set<number>(groupData.assignedDeviceIds);
      const devicesInGroup = allDevicesReplyMsg.body.devices.filter(x => deviceIdsInGroupSet.has(x.id));
      this.sorterSvc.sortBy(devicesInGroup, x => x.name);
      this.signals.devicesInGroup.set(devicesInGroup);
      const deviceGroupTariffIds = new Set<number>(groupData.assignedTariffIds);
      const deviceGroupTariffs = tariffsReplyMsg.body.tariffs.filter(x => deviceGroupTariffIds.has(x.id));
      this.sorterSvc.sortBy(deviceGroupTariffs, x => x.name);
      this.signals.deviceGroupTariffs.set(deviceGroupTariffs);
      const availableDeviceGroupTariffs = tariffsReplyMsg.body.tariffs.filter(x => x.enabled && !deviceGroupTariffIds.has(x.id));
      this.signals.availableTariffs.set(availableDeviceGroupTariffs);
    } else {
      // This is new device group
      this.signals.devicesInGroup.set([]);
      this.signals.availableTariffs.set(tariffsReplyMsg.body.tariffs.filter(x => x.enabled));
    }
  }

  onAddTariff(tariff: Tariff): void {
    const availableTariffs = this.signals.availableTariffs();
    const deviceGroupTariffs = this.signals.deviceGroupTariffs();
    const selectedTariffIndex = availableTariffs.indexOf(tariff);
    deviceGroupTariffs.push(tariff);
    availableTariffs.splice(selectedTariffIndex, 1);
    this.signals.availableTariffs.set(availableTariffs);
    this.signals.deviceGroupTariffs.set(deviceGroupTariffs);
  }

  onRemoveTariff(tariff: Tariff): void {
    const deviceGroupTariffs = this.signals.deviceGroupTariffs();
    const availableTariffs = this.signals.availableTariffs();
    const selectedTariffIndex = deviceGroupTariffs.indexOf(tariff);
    availableTariffs.push(tariff);
    deviceGroupTariffs.splice(selectedTariffIndex, 1);
    this.signals.availableTariffs.set(availableTariffs);
    this.signals.deviceGroupTariffs.set(deviceGroupTariffs);
  }

  onSave(): void {
    const formRawValue = this.form.getRawValue();
    const deviceGroup = this.signals.deviceGroup();
    if (deviceGroup) {
      // Update device group
      const msg = createUpdateDeviceGroupRequestMessage();
      msg.body.deviceGroup = {
        // TODO: Currently we don't have form control for enabled property - it could be removed in the future
        enabled: formRawValue.enabled!,
        id: deviceGroup.id,
        name: formRawValue.name!,
        restrictDeviceTransfers: formRawValue.restrictDeviceTransfers!,
        description: formRawValue.description,
      };
      msg.body.assignedTariffIds = this.signals.deviceGroupTariffs().map(x => x.id);
      this.messageTransportSvc.sendAndAwaitForReply(msg).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(replyMsg => this.processUpdateDeviceGroupReplyMessage(replyMsg as UpdateDeviceGroupReplyMessage));
    } else {
      // Create device group
      this.signals.createdDeviceGroup.set(null);
      const requestMsg = createCreateDeviceGroupRequestMessage();
      requestMsg.body.deviceGroup = this.createDeviceGroupFromForm();
      requestMsg.body.assignedTariffIds = this.signals.deviceGroupTariffs()?.map(x => x.id);
      this.messageTransportSvc.sendAndAwaitForReply(requestMsg).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(replyMsg => this.processCreateDeviceGroupReplyMessage(replyMsg as CreateDeviceGroupReplyMessage));
    }
  }

  processUpdateDeviceGroupReplyMessage(replyMsg: UpdateDeviceGroupReplyMessage): void {
    if (replyMsg.header.failure) {
      return;
    }
    this.notificationsSvc.show(NotificationType.success, translate('Device group updated'), null, IconName.check, replyMsg);
  }

  processCreateDeviceGroupReplyMessage(replyMsg: CreateDeviceGroupReplyMessage): void {
    if (replyMsg.header.failure) {
      return;
    }
    this.notificationsSvc.show(NotificationType.success, translate('Device group created'), null, IconName.check, replyMsg);
  }

  createDeviceGroupFromForm(): DeviceGroup {
    const formValue = this.form.getRawValue();
    const deviceGroup = {
      name: formValue.name,
      restrictDeviceTransfers: formValue.restrictDeviceTransfers,
      description: formValue.description,
    } as DeviceGroup;
    return deviceGroup;
  }

  onGoToList(): void {
    if (this.signals.isCreate()) {
      // We are in create mode
      this.router.navigate(['../'], { relativeTo: this.activatedRoute });
    } else {
      // We are in edit mode - go back more steps
      this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
    }
  }

  createForm(): FormGroup<FormControls> {
    const formControls: FormControls = {
      name: new FormControl('', { validators: [Validators.required] }),
      description: new FormControl(''),
      restrictDeviceTransfers: new FormControl(false),
      enabled: new FormControl(true),
    };
    const form = this.formBuilder.group<FormControls>(formControls);
    return form;
  }

  createSignals(): Signals {
    const signals: Signals = {
      deviceGroup: signal(null),
      createdDeviceGroup: signal(null),
      availableTariffs: signal([]),
      deviceGroupTariffs: signal([]),
      devicesInGroup: signal([]),
      isCreate: signal(false),
      isLoading: signal(false),
    };
    return signals;
  }
}

interface FormControls {
  name: FormControl<string | null>;
  description: FormControl<string | null>;
  restrictDeviceTransfers: FormControl<boolean | null>;
  enabled: FormControl<boolean | null>;
}

interface Signals {
  deviceGroup: WritableSignal<DeviceGroup | null>;
  createdDeviceGroup: WritableSignal<DeviceGroup | null>;
  availableTariffs: WritableSignal<Tariff[]>;
  deviceGroupTariffs: WritableSignal<Tariff[]>;
  devicesInGroup: WritableSignal<Device[]>;
  isCreate: WritableSignal<boolean>;
  isLoading: WritableSignal<boolean>;
}
