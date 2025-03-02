import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslocoDirective } from '@jsverse/transloco';
import { forkJoin, Observable } from 'rxjs';

import { FullDatePipe, InternalSubjectsService, MessageTransportService, MoneyFormatPipe, SorterService } from '@ccs3-operator/shared';
import {
  createGetAllDevicesRequestMessage, createGetAllTariffsRequestMessage, createGetAllUsersRequestMessage,
  createGetDeviceCompletedSessionsRequestMessage,
  Device, DeviceSession, GetAllDevicesReplyMessage, GetAllDevicesRequestMessageBody, GetAllTariffsReplyMessage,
  GetAllTariffsRequestMessageBody, GetAllUsersReplyMessage, GetAllUsersRequestMessageBody,
  GetDeviceCompletedSessionsReplyMessage, Message, ReplyMessage, Tariff, User
} from '@ccs3-operator/messages';
import { BooleanIndicatorComponent } from "../../../../boolean-indicator/src/lib/boolean-indicator.component";

@Component({
  selector: 'ccs3-op-device-sessions-report',
  templateUrl: 'device-sessions.component.html',
  imports: [
    ReactiveFormsModule, NgClass, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    TranslocoDirective, MoneyFormatPipe, FullDatePipe, BooleanIndicatorComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeviceSessionsComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  readonly form = this.createForm();
  readonly signals = this.createSignals();
  private readonly internalsSubjectsSvc = inject(InternalSubjectsService);
  private readonly messageTransportSvc = inject(MessageTransportService);
  private readonly sorterSvc = inject(SorterService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.internalsSubjectsSvc.whenSignedIn().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.init());
  }

  init(): void {
    this.loadData();
  }

  loadData(): void {
    this.signals.isReady.set(false);
    const getAllTariffsReqMsg = createGetAllTariffsRequestMessage();
    const getAllUsersReqMsg = createGetAllUsersRequestMessage();
    const getAllDevicesReqMsg = createGetAllDevicesRequestMessage();
    const obj: LoadDataObservablesObject = {
      allTariffs: this.messageTransportSvc.sendAndAwaitForReply<GetAllTariffsRequestMessageBody>(getAllTariffsReqMsg),
      allUsers: this.messageTransportSvc.sendAndAwaitForReply<GetAllUsersRequestMessageBody>(getAllUsersReqMsg),
      allDevices: this.messageTransportSvc.sendAndAwaitForReply<GetAllDevicesRequestMessageBody>(getAllDevicesReqMsg),
    };
    forkJoin(obj).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(replyMsgsObj => this.processLoadDataReplyMessages(replyMsgsObj as LoadDataMessagesObject));
  }

  processLoadDataReplyMessages(replyMsgsObj: LoadDataMessagesObject): void {
    if (replyMsgsObj.allDevices.header.failure
      || replyMsgsObj.allTariffs.header.failure
      || replyMsgsObj.allUsers.header.failure) {
      return;
    }
    this.sorterSvc.sortBy(replyMsgsObj.allDevices.body.devices, x => x.name);
    this.sorterSvc.sortBy(replyMsgsObj.allTariffs.body.tariffs, x => x.name);
    this.sorterSvc.sortBy(replyMsgsObj.allUsers.body.users, x => x.username);
    this.signals.allDevices.set(replyMsgsObj.allDevices.body.devices);
    this.signals.allTariffs.set(replyMsgsObj.allTariffs.body.tariffs);
    this.signals.allUsers.set(replyMsgsObj.allUsers.body.users);
    this.signals.allDevicesMap.set(new Map<number, Device>(replyMsgsObj.allDevices.body.devices.map(x => ([x.id, x]))));
    this.signals.allTariffsMap.set(new Map<number, Tariff>(replyMsgsObj.allTariffs.body.tariffs.map(x => ([x.id, x]))));
    this.signals.allUsersMap.set(new Map<number, User>(replyMsgsObj.allUsers.body.users.map(x => ([x.id, x]))));
    this.signals.isReady.set(true);
    this.changeDetectorRef.markForCheck();
  }

  onLoadDeviceSessions(): void {
    const formValue = this.form.value;
    const reqMsg = createGetDeviceCompletedSessionsRequestMessage();
    reqMsg.body.fromDate = new Date(formValue.fromDate!).toISOString();
    reqMsg.body.toDate = new Date(formValue.toDate!).toISOString();
    reqMsg.body.userId = formValue.userId;
    reqMsg.body.deviceId = formValue.deviceId;
    reqMsg.body.tariffId = formValue.tariffId;
    this.signals.sessionsLoaded.set(false);
    this.messageTransportSvc.sendAndAwaitForReply(reqMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(replyMsg => this.processGetDeviceCompletedSessionsReplyMessage(replyMsg as GetDeviceCompletedSessionsReplyMessage));
  }

  processGetDeviceCompletedSessionsReplyMessage(replyMsg: GetDeviceCompletedSessionsReplyMessage): void {
    if (replyMsg.header.failure) {
      return;
    }
    this.signals.replyMessage.set(replyMsg);
    this.signals.sessionsLoaded.set(true);
    const displayItems = this.createSessionDisplayItems(replyMsg.body.deviceSessions);
    this.signals.sessionDisplayItems.set(displayItems);
    this.changeDetectorRef.markForCheck();
  }

  createSessionDisplayItems(deviceSessions: DeviceSession[]): SessionDisplayItem[] {
    const items: SessionDisplayItem[] = [];
    const devicesMap = this.signals.allDevicesMap()!;
    const usersMap = this.signals.allUsersMap()!;
    const tariffsMap = this.signals.allTariffsMap()!;
    for (const deviceSession of deviceSessions) {
      const item: SessionDisplayItem = {
        deviceSession: deviceSession,
        deviceName: devicesMap.get(deviceSession.deviceId)?.name,
        tariffName: tariffsMap.get(deviceSession.tariffId)?.name,
        startedByUsername: usersMap.get(deviceSession.startedByUserId!)?.username,
        stoppedByUsername: usersMap.get(deviceSession.stoppedByUserId!)?.username,
      };
      items.push(item);
    }
    return items;
  }

  createForm(): FormGroup<FormControls> {
    const controls: FormControls = {
      fromDate: new FormControl(null, { validators: [Validators.required] }),
      toDate: new FormControl(null, { validators: [Validators.required] }),
      userId: new FormControl(null),
      tariffId: new FormControl(null),
      deviceId: new FormControl(null),
    };
    const form = this.formBuilder.group<FormControls>(controls);
    return form;
  }

  createSignals(): Signals {
    const signals: Signals = {
      isReady: signal(false),
      sessionsLoaded: signal(false),
      allDevices: signal(null),
      allDevicesMap: signal(null),
      allTariffs: signal(null),
      allTariffsMap: signal(null),
      allUsers: signal(null),
      allUsersMap: signal(null),
      sessionDisplayItems: signal([]),
      replyMessage: signal(null),
    };
    return signals;
  }
}

interface SessionDisplayItem {
  deviceSession: DeviceSession;
  startedByUsername?: string | null;
  stoppedByUsername?: string | null;
  tariffName?: string | null;
  deviceName?: string | null;
}

interface Signals {
  isReady: WritableSignal<boolean>;
  sessionsLoaded: WritableSignal<boolean>;
  allTariffs: WritableSignal<Tariff[] | null>;
  allTariffsMap: WritableSignal<Map<number, Tariff> | null>;
  allUsers: WritableSignal<User[] | null>;
  allUsersMap: WritableSignal<Map<number, User> | null>;
  allDevices: WritableSignal<Device[] | null>;
  allDevicesMap: WritableSignal<Map<number, Device> | null>;
  sessionDisplayItems: WritableSignal<SessionDisplayItem[]>;
  replyMessage: WritableSignal<GetDeviceCompletedSessionsReplyMessage | null>;
}

interface FormControls {
  fromDate: FormControl<string | null>;
  toDate: FormControl<string | null>;
  userId: FormControl<number | null>;
  tariffId: FormControl<number | null>;
  deviceId: FormControl<number | null>;
}

interface LoadDataObservablesObject extends Record<string, Observable<Message<unknown>>> {
  allTariffs: Observable<Message<unknown>>;
  allUsers: Observable<Message<unknown>>;
  allDevices: Observable<Message<unknown>>;
}

interface LoadDataMessagesObject extends Record<string, ReplyMessage<unknown>> {
  allUsers: GetAllUsersReplyMessage;
  allTariffs: GetAllTariffsReplyMessage;
  allDevices: GetAllDevicesReplyMessage;
}
