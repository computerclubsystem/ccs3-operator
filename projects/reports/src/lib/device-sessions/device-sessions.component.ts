import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgClass, NgStyle } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { TranslocoDirective } from '@jsverse/transloco';
import { forkJoin, Observable } from 'rxjs';

import {
  FullDatePipe, GroupingService, InternalSubjectsService, MessageTransportService, MoneyFormatPipe, NoYearDatePipe, SecondsToTimePipe, SorterService,
  SortOrder
} from '@ccs3-operator/shared';
import {
  createGetAllDevicesRequestMessage, createGetAllTariffsRequestMessage, createGetAllUsersRequestMessage,
  createGetDeviceCompletedSessionsRequestMessage, Device, DeviceSession, GetAllDevicesReplyMessage,
  GetAllDevicesRequestMessageBody, GetAllTariffsReplyMessage, GetAllTariffsRequestMessageBody,
  GetAllUsersReplyMessage, GetAllUsersRequestMessageBody, GetDeviceCompletedSessionsReplyMessage, Message,
  ReplyMessage, Tariff, TariffType, User
} from '@ccs3-operator/messages';
import { BooleanIndicatorComponent } from '@ccs3-operator/boolean-indicator';

@Component({
  selector: 'ccs3-op-device-sessions-report',
  templateUrl: 'device-sessions.component.html',
  imports: [
    ReactiveFormsModule, NgClass, NgStyle, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatCheckboxModule, MatDividerModule, TranslocoDirective, MoneyFormatPipe, FullDatePipe, NoYearDatePipe,
    SecondsToTimePipe, BooleanIndicatorComponent
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
  private readonly groupingSvc = inject(GroupingService);
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
    const fromDate = new Date(formValue.fromDate!).toISOString();
    const toDate = new Date(formValue.toDate!).toISOString();
    reqMsg.body.fromDate = fromDate;
    reqMsg.body.toDate = toDate;
    reqMsg.body.userId = formValue.userId;
    reqMsg.body.deviceId = formValue.deviceId;
    reqMsg.body.tariffId = formValue.tariffId;
    this.signals.sessionsLoaded.set(false);
    this.messageTransportSvc.sendAndAwaitForReply(reqMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(replyMsg => this.processGetDeviceCompletedSessionsReplyMessage(
      replyMsg as GetDeviceCompletedSessionsReplyMessage,
      fromDate,
      toDate,
    ));
  }

  processGetDeviceCompletedSessionsReplyMessage(
    replyMsg: GetDeviceCompletedSessionsReplyMessage,
    fromDate: string,
    toDate: string,
  ): void {
    if (replyMsg.header.failure) {
      return;
    }
    this.signals.replyMessage.set(replyMsg);
    this.signals.sessionsLoaded.set(true);
    const displayItems = this.createSessionDisplayItems(replyMsg.body.deviceSessions);
    this.signals.sessionDisplayItems.set(displayItems);

    const chartInfo = this.createDeviceSessionChartInfos(replyMsg.body.deviceSessions, fromDate, toDate);
    this.signals.deviceSessionsUsageChartInfo.set(chartInfo);

    const deviceUsageSummaryInfo = this.createDeviceUsageSummaryInfo(replyMsg.body.deviceSessions, fromDate, toDate);
    this.sorterSvc.sortBy(deviceUsageSummaryInfo, x => x.totalAmount, SortOrder.descending);
    this.signals.deviceUsageSummary.set(deviceUsageSummaryInfo);

    const tariffUsageSummaryInfo = this.createTariffSessionChartInfos(replyMsg.body.deviceSessions);
    // Sort by totalAmount, if equal - by totalSeconds, if equal again - by totalCount
    this.sorterSvc.sortByMany(tariffUsageSummaryInfo, [{
      sortOrder: SortOrder.descending,
      valueSelector: x => x.totalAmount,
    }, {
      sortOrder: SortOrder.descending,
      valueSelector: x => x.totalSeconds,
    }, {
      // It is highly unlikely the tariff summary item to have same totalSeconds to need to sort by totalCount
      sortOrder: SortOrder.descending,
      valueSelector: x => x.totalCount,
    }]);
    this.signals.tariffUsageSummary.set(tariffUsageSummaryInfo);

    this.changeDetectorRef.markForCheck();
  }

  createDeviceUsageSummaryInfo(deviceSessions: DeviceSession[], fromDate: string, toDate: string): DeviceUsageSummaryInfo[] {
    const summaryInfo: DeviceUsageSummaryInfo[] = [];
    const periodFromSeconds = Math.round(new Date(fromDate).getTime() / 1000);
    const periodToSeconds = Math.round(new Date(toDate).getTime() / 1000);
    const durationSeconds = periodToSeconds - periodFromSeconds;
    const map = new Map<number, DeviceUsageSummaryInfo>();
    const allDevicesMap = this.signals.allDevicesMap()!;
    for (const session of deviceSessions) {
      const startedAtTime = new Date(session.startedAt).getTime();
      const stoppedAtTime = new Date(session.stoppedAt).getTime();
      const sessionDurationMilliseconds = stoppedAtTime - startedAtTime;
      const mapItem = map.get(session.deviceId);
      if (!mapItem) {
        const item: DeviceUsageSummaryInfo = {
          device: allDevicesMap.get(session.deviceId)!,
          // This will be calculated later
          percentage: 0,
          totalCount: 1,
          // This will be in milliseconds - later we will convert it to seconds
          totalSeconds: sessionDurationMilliseconds,
          totalAmount: session.totalAmount,
          zeroPriceCount: session.totalAmount === 0 ? 1 : 0,
          zeroPriceTotalSeconds: session.totalAmount === 0 ? sessionDurationMilliseconds : 0,
          zeroPricePercentage: 0,
        };
        map.set(session.deviceId, item);
      } else {
        mapItem.totalCount++;
        mapItem.totalSeconds += sessionDurationMilliseconds;
        mapItem.totalAmount += session.totalAmount;
        if (session.totalAmount === 0) {
          mapItem.zeroPriceCount++;
          mapItem.zeroPriceTotalSeconds += sessionDurationMilliseconds;
        }
      }
    }
    for (const mapItem of map) {
      const infoItem = mapItem[1];
      // totalSeconds contains milliseconds - convert them to seconds
      infoItem.totalSeconds = Math.round(infoItem.totalSeconds / 1000);
      infoItem.zeroPriceTotalSeconds = Math.round(infoItem.zeroPriceTotalSeconds / 1000);
      infoItem.percentage = Math.round((infoItem.totalSeconds / durationSeconds) * 100);
      infoItem.zeroPricePercentage = Math.round((infoItem.zeroPriceTotalSeconds / infoItem.totalSeconds) * 100);
      infoItem.totalAmount = Math.round(infoItem.totalAmount * 100) / 100;
      summaryInfo.push(infoItem);
    }
    return summaryInfo;
  }

  createTariffSessionChartInfos(deviceSessions: DeviceSession[]): TariffUsageSummaryInfo[] {
    const summaryInfos: TariffUsageSummaryInfo[] = [];
    const allTariffsMap = this.signals.allTariffsMap()!;
    const map = new Map<number, TariffUsageSummaryInfo>();
    for (const session of deviceSessions) {
      const startedAtTime = new Date(session.startedAt).getTime();
      const stoppedAtTime = new Date(session.stoppedAt).getTime();
      const sessionDurationMilliseconds = stoppedAtTime - startedAtTime;
      const mapItem = map.get(session.tariffId);
      const tariff = allTariffsMap.get(session.tariffId)!;
      const tariffPrice = tariff.type !== TariffType.prepaid ? tariff.price : 0;
      if (!mapItem) {
        map.set(session.tariffId, {
          tariff: tariff,
          totalAmount: tariffPrice,
          totalCount: 1,
          totalSeconds: sessionDurationMilliseconds,
        });
      } else {
        mapItem.totalAmount += tariffPrice;
        mapItem.totalCount++;
        mapItem.totalSeconds += sessionDurationMilliseconds;
      }
    }
    for (const mapItem of map) {
      const infoItem = mapItem[1];
      // totalSeconds contains milliseconds - convert them to seconds
      infoItem.totalSeconds = Math.round(infoItem.totalSeconds / 1000);
      infoItem.totalAmount = Math.round(infoItem.totalAmount * 100) / 100;
      summaryInfos.push(infoItem);
    }
    return summaryInfos;
  }

  createDeviceSessionChartInfos(deviceSessions: DeviceSession[], fromDate: string, toDate: string): DeviceSessionsUsageChartInfo[] {
    const periodFromSeconds = Math.round(new Date(fromDate).getTime() / 1000);
    const periodToSeconds = Math.round(new Date(toDate).getTime() / 1000);
    const durationSeconds = periodToSeconds - periodFromSeconds;
    const chartInfo: DeviceSessionsUsageChartInfo[] = [];
    const allDevicesMap = this.signals.allDevicesMap()!;
    const allTariffsMap = this.signals.allTariffsMap()!;
    const groupedByDeviceId = this.groupingSvc.groupBy(deviceSessions, x => x.deviceId);
    let fakeSessionUsageId = 0;
    const generateFakeSessionUsageId = () => `idle-session-id-${++fakeSessionUsageId}`;
    for (const grp of groupedByDeviceId) {
      this.sorterSvc.sortBy(grp.items, x => new Date(x.startedAt));
      const sessionInfos: SessionUsageChartInfo[] = [];
      for (const session of grp.items) {
        const sessionStartSeconds = Math.round(new Date(session.startedAt).getTime() / 1000);
        const sessionStopSeconds = Math.round(new Date(session.stoppedAt).getTime() / 1000);
        let sessionFromSecond = sessionStartSeconds - periodFromSeconds;
        if (sessionFromSecond < 0) {
          sessionFromSecond = 0;
        }
        let sessionToSecond = sessionStopSeconds - periodFromSeconds;
        if (sessionToSecond > durationSeconds) {
          sessionToSecond = durationSeconds;
        }
        sessionInfos.push({
          session: session,
          fromSecond: sessionFromSecond,
          toSecond: sessionToSecond,
          tariff: allTariffsMap.get(session.tariffId)!,
          isIdle: false,
          sessionUsageId: `${session.id}`,
        });
      }
      const deviceFinalSessionInfos: SessionUsageChartInfo[] = [];
      // Fill idle periods with idle sessions
      for (let idx = 0; idx < sessionInfos.length; idx++) {
        const currentSessionInfo = sessionInfos[idx];
        const prevSessionInfo = sessionInfos[idx - 1];
        if (prevSessionInfo) {
          // There is previous session
          // Check if there is a gap between the stop of the previous session and start of the current one
          if (currentSessionInfo.fromSecond > prevSessionInfo.toSecond) {
            // There is a gap - create idle session
            deviceFinalSessionInfos.push({
              fromSecond: prevSessionInfo.toSecond,
              toSecond: currentSessionInfo.fromSecond,
              session: null,
              tariff: null,
              isIdle: true,
              sessionUsageId: generateFakeSessionUsageId(),
            });
          }
        } else {
          // There is no previous session
          // Check if current session starts from the beginning and if not - add idle session
          if (currentSessionInfo.fromSecond > 0) {
            deviceFinalSessionInfos.push({
              fromSecond: 0,
              toSecond: currentSessionInfo.fromSecond,
              session: null,
              tariff: null,
              isIdle: true,
              sessionUsageId: generateFakeSessionUsageId(),
            });
          }
        }
        deviceFinalSessionInfos.push(currentSessionInfo);
      }
      //Check if there is an idle session after the last one
      const lastSessionInfo = sessionInfos[sessionInfos.length - 1];
      if (lastSessionInfo && (lastSessionInfo.toSecond < durationSeconds)) {
        deviceFinalSessionInfos.push({
          fromSecond: lastSessionInfo.toSecond,
          toSecond: durationSeconds,
          session: null,
          tariff: null,
          isIdle: true,
          sessionUsageId: generateFakeSessionUsageId(),
        });
      }
      const fractions = deviceFinalSessionInfos.map(x => Math.max(x.toSecond - x.fromSecond, 1)).map(x => `${x}fr`).join(' ');
      // const gridStyle = `display: grid; grid-template-columns: ${fractions}`;
      const gridStyleObject: Record<string, string> = {
        display: 'grid',
        'grid-template-columns': `auto ${fractions}`,
      };
      let totalSessionsAmount = 0;
      for (const finalInfo of deviceFinalSessionInfos) {
        const sessionTotalAmount = finalInfo.session?.totalAmount || 0;
        totalSessionsAmount = Math.round((totalSessionsAmount + sessionTotalAmount) * 100) / 100;
      }
      chartInfo.push({
        device: allDevicesMap.get(grp.key)!,
        sessionChartInfos: deviceFinalSessionInfos,
        cssGridStyleObject: gridStyleObject,
        totalSessionsAmount: totalSessionsAmount,
      });
    }
    this.sorterSvc.sortBy(chartInfo, x => x.totalSessionsAmount, SortOrder.descending);
    return chartInfo;
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
      showTable: new FormControl(true),
      showChart: new FormControl(true),
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
      deviceSessionsUsageChartInfo: signal(null),
      deviceUsageSummary: signal(null),
      tariffUsageSummary: signal(null),
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
  deviceSessionsUsageChartInfo: WritableSignal<DeviceSessionsUsageChartInfo[] | null>;
  deviceUsageSummary: WritableSignal<DeviceUsageSummaryInfo[] | null>;
  tariffUsageSummary: WritableSignal<TariffUsageSummaryInfo[] | null>;
}

interface FormControls {
  fromDate: FormControl<string | null>;
  toDate: FormControl<string | null>;
  userId: FormControl<number | null>;
  tariffId: FormControl<number | null>;
  deviceId: FormControl<number | null>;
  showChart: FormControl<boolean | null>;
  showTable: FormControl<boolean | null>;
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

interface SessionUsageChartInfo {
  fromSecond: number;
  toSecond: number;
  tariff?: Tariff | null;
  session?: DeviceSession | null;
  isIdle: boolean;
  sessionUsageId: string;
}

interface DeviceSessionsUsageChartInfo {
  device: Device;
  cssGridStyleObject: Record<string, string>;
  sessionChartInfos: SessionUsageChartInfo[];
  totalSessionsAmount: number;
}

interface DeviceUsageSummaryInfo {
  device: Device;
  totalSeconds: number;
  totalCount: number;
  totalAmount: number;
  percentage: number;
  zeroPriceCount: number;
  zeroPriceTotalSeconds: number;
  zeroPricePercentage: number;
}

interface TariffUsageSummaryInfo {
  tariff: Tariff;
  totalSeconds: number;
  totalCount: number;
  totalAmount: number;
}
