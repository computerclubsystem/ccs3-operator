import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { translate, TranslocoDirective } from '@jsverse/transloco';

import {
  Device, GetDeviceByIdReplyMessage, UpdateDeviceReplyMessage, createGetDeviceByIdRequestMessage, createUpdateDeviceRequestMessage,
} from '@ccs3-operator/messages';
import { InternalSubjectsService, MessageTransportService, FullDatePipe } from '@ccs3-operator/shared';
import { NotificationsService, NotificationType } from '@ccs3-operator/notifications';
import { IconName } from '@ccs3-operator/shared/types';

@Component({
  selector: 'ccs3-op-edit-device',
  templateUrl: 'edit-device.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatCheckboxModule,
    TranslocoDirective, MatButtonModule, FullDatePipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditDeviceComponent implements OnInit {
  signals = this.createSignals();
  form!: FormGroup<FormControls>;

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly messageTransportSvc = inject(MessageTransportService);
  private readonly internalSubjectsSvc = inject(InternalSubjectsService);
  private readonly notificationsSvc = inject(NotificationsService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private deviceId!: number;

  ngOnInit(): void {
    this.form = this.createForm();
    this.deviceId = +this.activatedRoute.snapshot.paramMap.get('deviceId')!;
    this.internalSubjectsSvc.whenSignedIn().pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.loadDevice(this.deviceId));
  }

  loadDevice(deviceId: number): void {
    const msg = createGetDeviceByIdRequestMessage();
    msg.body.deviceId = deviceId;
    this.messageTransportSvc.sendAndAwaitForReply(msg)
      .subscribe(getAllDevicesReplyMsg => this.processGetDeviceByIdReplyMessage(getAllDevicesReplyMsg));
  }

  processGetDeviceByIdReplyMessage(replyMsg: GetDeviceByIdReplyMessage): void {
    const device = replyMsg.body.device;
    this.form.patchValue({
      approved: device.approved,
      certificateThumbprint: device.certificateThumbprint,
      description: device.description,
      enabled: device.enabled,
      id: device.id,
      ipAddress: device.ipAddress,
      name: device.name,
    })
    this.signals.device.set(device);
  }

  onSave(): void {
    const msg = createUpdateDeviceRequestMessage();
    msg.body.device = {
      id: this.deviceId,
      approved: this.form.value.approved!,
      certificateThumbprint: this.form.value.certificateThumbprint!,
      enabled: this.form.value.enabled!,
      ipAddress: this.form.value.ipAddress!,
      description: this.form.value.description!,
      name: this.form.value.name!,
    } as Device;
    this.messageTransportSvc.sendAndAwaitForReply(msg)
      .subscribe(updateDeviceReplyMsg => this.processUpdateDeviceReplyMessage(updateDeviceReplyMsg));
  }

  processUpdateDeviceReplyMessage(updateDeviceReplyMessage: UpdateDeviceReplyMessage): void {
    if (updateDeviceReplyMessage.body.device) {
      this.notificationsSvc.show(NotificationType.success, translate('Device updated'), null, IconName.check, updateDeviceReplyMessage);
    } else {
      this.notificationsSvc.show(NotificationType.warn, translate(`Can't update device`), null, IconName.check, updateDeviceReplyMessage);
    }
  }

  onGoToList(): void {
    this.router.navigate(['../..'], { relativeTo: this.activatedRoute });
  }

  createForm(): FormGroup<FormControls> {
    const formControls: FormControls = {
      id: new FormControl(),
      name: new FormControl('', { validators: [Validators.required] }),
      approved: new FormControl(false),
      enabled: new FormControl(false),
      description: new FormControl(''),
      certificateThumbprint: new FormControl('', { validators: [Validators.required] }),
      ipAddress: new FormControl(''),
    };
    formControls.id.disable();
    const form = this.formBuilder.group<FormControls>(formControls);
    return form;
  }

  createSignals(): Signals {
    const signals: Signals = {
      device: signal(null),
    };
    return signals;
  }
}

interface Signals {
  device: WritableSignal<Device | null>;
}

interface FormControls {
  id: FormControl<number>;
  name: FormControl<string | null>;
  approved: FormControl<boolean | null>;
  enabled: FormControl<boolean | null>;
  description: FormControl<string | null>;
  certificateThumbprint: FormControl<string | null>;
  ipAddress: FormControl<string | null>;
}
