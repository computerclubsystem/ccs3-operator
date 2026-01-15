import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { translate, TranslocoDirective } from '@jsverse/transloco';
import { forkJoin } from 'rxjs';

import {
  CreateDeviceReplyMessage,
  Device, DeviceGroup, GetAllDeviceGroupsReplyMessage, GetDeviceByIdReplyMessage, UpdateDeviceReplyMessage, createCreateDeviceRequestMessage, createGetAllDeviceGroupsRequestMessage, createGetDeviceByIdRequestMessage, createUpdateDeviceRequestMessage,
} from '@ccs3-operator/messages';
import { MessageTransportService, NotificationType, IconName } from '@ccs3-operator/shared';
import { NotificationService } from '@ccs3-operator/notification';

@Component({
  selector: 'ccs3-op-create-device',
  templateUrl: 'create-device.html',
  imports: [
    ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatCheckboxModule,
    TranslocoDirective, MatButtonModule, MatSelectModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateDeviceComponent implements OnInit {
  signals = this.createSignals();
  form!: FormGroup<FormControls>;

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly messageTransportSvc = inject(MessageTransportService);
  private readonly notificationSvc = inject(NotificationService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private deviceId!: number;

  ngOnInit(): void {
    this.form = this.createForm();
    this.deviceId = +this.activatedRoute.snapshot.paramMap.get('deviceId')!;
    this.init();
  }

  init(): void {
    this.signals.isCreate.set(!this.deviceId);
    if (this.deviceId) {
      this.loadDeviceData(this.deviceId);
    } else {
      this.loadDeviceGroups();
    }
  }

  loadDeviceGroups(): void {
    this.signals.isLoading.set(true);
    const reqMsg = createGetAllDeviceGroupsRequestMessage();
    this.messageTransportSvc.sendAndAwaitForReply(reqMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(replyMsg => this.processGetAllDeviceGroupsReplyMessage(replyMsg as GetAllDeviceGroupsReplyMessage));
  }

  processGetAllDeviceGroupsReplyMessage(replyMsg: GetAllDeviceGroupsReplyMessage): void {
    if (replyMsg.header.failure) {
      return;
    }
    this.signals.isLoading.set(false);
    this.signals.allDeviceGroups.set(replyMsg.body.deviceGroups);
  }

  loadDeviceData(deviceId: number): void {
    this.signals.isLoading.set(true);
    const getDeviceByIdReqMsg = createGetDeviceByIdRequestMessage();
    getDeviceByIdReqMsg.body.deviceId = deviceId;
    const getDeviceById$ = this.messageTransportSvc.sendAndAwaitForReply(getDeviceByIdReqMsg);
    const getAllDeviceGroupsReqMsg = createGetAllDeviceGroupsRequestMessage();
    const getAllDeviceGroups$ = this.messageTransportSvc.sendAndAwaitForReply(getAllDeviceGroupsReqMsg);
    forkJoin([getDeviceById$, getAllDeviceGroups$]).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(([getDeviceByIdReplyMsg, getAllDeviceGroupsReplyMsg]) =>
      this.processLoadedDataReplies(
        getDeviceByIdReplyMsg as GetDeviceByIdReplyMessage,
        getAllDeviceGroupsReplyMsg as GetAllDeviceGroupsReplyMessage,
      )
    );
  }

  processLoadedDataReplies(
    getDeviceByIdReplyMsg: GetDeviceByIdReplyMessage,
    getAllDeviceGroupsReplyMsg: GetAllDeviceGroupsReplyMessage,
  ): void {
    this.signals.isLoading.set(false);
    if (getDeviceByIdReplyMsg.header.failure
      || getAllDeviceGroupsReplyMsg.header.failure
    ) {
      return;
    }
    this.processGetAllDeviceGroupsReplyMessage(getAllDeviceGroupsReplyMsg);
    const device = getDeviceByIdReplyMsg.body.device;
    this.form.patchValue({
      approved: device.approved,
      certificateThumbprint: device.certificateThumbprint,
      description: device.description,
      enabled: device.enabled,
      id: device.id,
      ipAddress: device.ipAddress,
      name: device.name,
      deviceGroupId: device.deviceGroupId,
      transferAllowed: !device.disableTransfer,
    });
    this.signals.device.set(device);
  }

  onSave(): void {
    const formRawValue = this.form.getRawValue();
    const device = this.signals.device();
    if (device) {
      // Update device
      const msg = createUpdateDeviceRequestMessage();
      msg.body.device = {
        id: this.deviceId,
        approved: formRawValue.approved!,
        certificateThumbprint: formRawValue.certificateThumbprint!,
        enabled: formRawValue.enabled!,
        ipAddress: formRawValue.ipAddress!,
        description: formRawValue.description!,
        name: formRawValue.name!,
        disableTransfer: !formRawValue.transferAllowed,
        deviceGroupId: formRawValue.deviceGroupId,
      } as Device;
      this.messageTransportSvc.sendAndAwaitForReply(msg)
        .subscribe(updateDeviceReplyMsg => this.processUpdateDeviceReplyMessage(updateDeviceReplyMsg as UpdateDeviceReplyMessage));
    } else {
      // Create device
      this.signals.createdDevice.set(null);
      const requestMsg = createCreateDeviceRequestMessage();
      requestMsg.body.device = this.createDevice();
      this.messageTransportSvc.sendAndAwaitForReply(requestMsg).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(replyMsg => this.processCreateDeviceReplyMessage(replyMsg as CreateDeviceReplyMessage));
    }
  }

  processCreateDeviceReplyMessage(replyMsg: CreateDeviceReplyMessage): void {
    if (replyMsg.header.failure) {
      return;
    }
    this.signals.createdDevice.set(replyMsg.body.device);
    this.notificationSvc.show(NotificationType.success, translate('Device created'), null, IconName.check, replyMsg);
  }

  processUpdateDeviceReplyMessage(updateDeviceReplyMessage: UpdateDeviceReplyMessage): void {
    if (updateDeviceReplyMessage.header.failure) {
      return;
    }
    this.notificationSvc.show(NotificationType.success, translate('Device updated'), null, IconName.check, updateDeviceReplyMessage);
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

  createDevice(): Device {
    const formValue = this.form.getRawValue();
    const device = {
      approved: formValue.approved,
      certificateThumbprint: formValue.certificateThumbprint,
      enabled: formValue.enabled,
      ipAddress: formValue.ipAddress,
      description: formValue.description,
      name: formValue.name,
      deviceGroupId: formValue.deviceGroupId,
      disableTransfer: !formValue.transferAllowed,
    } as Device;
    return device;
  }

  createForm(): FormGroup<FormControls> {
    const formControls: FormControls = {
      id: new FormControl(),
      name: new FormControl('', { validators: [Validators.required] }),
      approved: new FormControl(false),
      enabled: new FormControl(false),
      transferAllowed: new FormControl(true),
      description: new FormControl(''),
      certificateThumbprint: new FormControl(''),
      deviceGroupId: new FormControl(null),
      ipAddress: new FormControl('', { validators: [Validators.required] }),
    };
    formControls.id.disable();
    const form = this.formBuilder.group<FormControls>(formControls);
    return form;
  }

  createSignals(): Signals {
    const signals: Signals = {
      device: signal(null),
      allDeviceGroups: signal([]),
      createdDevice: signal(null),
      isCreate: signal(false),
      isLoading: signal(false),
    };
    return signals;
  }
}

interface Signals {
  device: WritableSignal<Device | null>;
  allDeviceGroups: WritableSignal<DeviceGroup[]>;
  createdDevice: WritableSignal<Device | null>;
  isCreate: WritableSignal<boolean>;
  isLoading: WritableSignal<boolean>;
}

interface FormControls {
  id: FormControl<number>;
  name: FormControl<string | null>;
  approved: FormControl<boolean | null>;
  enabled: FormControl<boolean | null>;
  transferAllowed: FormControl<boolean | null>;
  description: FormControl<string | null>;
  certificateThumbprint: FormControl<string | null>;
  deviceGroupId: FormControl<number | null>;
  ipAddress: FormControl<string | null>;
}
