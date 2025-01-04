import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { translate, TranslocoDirective } from '@jsverse/transloco';
import { filter } from 'rxjs';

import { createGetAllDevicesRequestMessage, createGetAllTariffsRequestMessage, createGetDeviceStatusesRequestMessage, createStartDeviceRequestMessage, Device, DeviceStatus, DeviceStatusesNotificationMessage, GetAllDevicesReplyMessage, GetAllTariffsReplyMessage, GetDeviceStatusesReplyMessage, MessageType, NotificationMessageType, StartDeviceReplyMessage, Tariff, TariffType } from '@ccs3-operator/messages';
import { InternalSubjectsService, MessageTransportService, SecondsToTimePipe } from '@ccs3-operator/shared';
import { NotificationsService, NotificationType } from '@ccs3-operator/notifications';
import { IconName } from '@ccs3-operator/shared/types';

@Component({
  selector: 'ccs3-op-computers-status',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatInputModule, MatSelectModule, TranslocoDirective, NgTemplateOutlet, SecondsToTimePipe],
  templateUrl: 'computers-status.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComputersStatusComponent implements OnInit {
  readonly signals = this.createSignals();
  private readonly state = this.createState();
  private readonly messageTransportSvc = inject(MessageTransportService);
  private readonly internalSubjectsSvc = inject(InternalSubjectsService);
  private readonly notificationsSvc = inject(NotificationsService);
  private readonly destroyRef = inject(DestroyRef);
  private allDevicesMap = new Map<number, Device>();
  allTariffsMap = new Map<number, Tariff>();
  allEnabledTariffs: Tariff[] = [];

  deviceStatusItemIdentity = (obj: DeviceStatusItem) => obj;

  ngOnInit(): void {
    this.internalSubjectsSvc.whenSignedIn().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.init());
  }

  init(): void {
    this.loadEntities();
    this.subscribeToSubjects();
    const getDeviceStatusesRequestMsg = createGetDeviceStatusesRequestMessage();
    this.messageTransportSvc.sendAndAwaitForReplyByType(getDeviceStatusesRequestMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(getDeviceStatusesReplyMsg => this.processGetDeviceStatusesReplyMessage(getDeviceStatusesReplyMsg));
  }

  onStart(item: DeviceStatusItem): void {
    const startDeviceRequestMsg = createStartDeviceRequestMessage();
    startDeviceRequestMsg.body.deviceId = item.deviceStatus.deviceId;
    startDeviceRequestMsg.body.tariffId = item.selectedTariffItem.id;
    this.messageTransportSvc.sendAndAwaitForReplyByType(startDeviceRequestMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(startDeviceReplyMsg => this.processStartDeviceReplyMessage(startDeviceReplyMsg));
  }

  processGetDeviceStatusesReplyMessage(getDeviceStatusesReplyMsg: GetDeviceStatusesReplyMessage): void {
    // Convert it to notification and call existing function that will process it
    const deviceStatusesNotificationMsg: DeviceStatusesNotificationMessage = {
      body: {
        deviceStatuses: getDeviceStatusesReplyMsg.body.deviceStatuses,
      },
      header: {
        type: NotificationMessageType.deviceStatusesNotification,
        errors: getDeviceStatusesReplyMsg.header.errors,
        failure: getDeviceStatusesReplyMsg.header.failure,
      },
    };
    this.processDeviceStatusesNotificationMessage(deviceStatusesNotificationMsg);
  }

  processStartDeviceReplyMessage(startDeviceReplyMsg: StartDeviceReplyMessage): void {
    if (startDeviceReplyMsg.header.failure) {
      const errors = startDeviceReplyMsg.header.errors?.map(x => `Error code ${x.code}: ${x.description}`);
      const errorsText = errors?.join(' ; ');
      this.notificationsSvc.show(NotificationType.error, translate(`Can't start the computer`), errorsText, IconName.error, startDeviceReplyMsg);
      return;
    }
  }

  loadEntities(): void {
    const getAllDevicesRequestMsg = createGetAllDevicesRequestMessage();
    this.messageTransportSvc.sendAndAwaitForReplyByType(getAllDevicesRequestMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(allDevicesReplyMsg => this.processAllDevicesReplyMessage(allDevicesReplyMsg));
    const getAllTariffsRequestMsg = createGetAllTariffsRequestMessage();
    this.messageTransportSvc.sendAndAwaitForReplyByType(getAllTariffsRequestMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(allTariffsReplyMsg => this.processAllTariffsReplyMessage(allTariffsReplyMsg));
  }

  processAllDevicesReplyMessage(allDevicesReplyMsg: GetAllDevicesReplyMessage): void {
    if (!allDevicesReplyMsg.body.devices) {
      return;
    }
    this.allDevicesMap = new Map<number, Device>(allDevicesReplyMsg.body.devices.map(device => [device.id, device]));
    // When all devices are available, we must refresh the signals.deviceStatusItems to show device names
    this.refreshDeviceStatusItemsWithLastNotificationMessage();
  }

  refreshDeviceStatusItemsWithLastNotificationMessage(): void {
    if (this.state.lastDeviceStatusesNotificationMessage) {
      const deviceStatusItems = this.createDeviceStatusItems(this.state.lastDeviceStatusesNotificationMessage.body.deviceStatuses);
      this.signals.deviceStatusItems.set(deviceStatusItems);
    }
  }

  processAllTariffsReplyMessage(allTariffsReplyMsg: GetAllTariffsReplyMessage): void {
    if (!allTariffsReplyMsg.body.tariffs) {
      return;
    }
    this.allTariffsMap = new Map<number, Tariff>(allTariffsReplyMsg.body.tariffs.map(tariff => [tariff.id, tariff]));
    this.allEnabledTariffs = allTariffsReplyMsg.body.tariffs.filter(x => x.enabled);
    // When all tariffs are available, we must refresh the signals.deviceStatusItems to show tariff names
    this.refreshDeviceStatusItemsWithLastNotificationMessage();
  }

  subscribeToSubjects(): void {
    this.messageTransportSvc.getMessageReceivedObservable().pipe(
      filter(msg => (msg.header.type as unknown as NotificationMessageType) === NotificationMessageType.deviceStatusesNotification),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(deviceStatusesMsg => this.processDeviceStatusesNotificationMessage(deviceStatusesMsg as unknown as DeviceStatusesNotificationMessage));
  }

  processDeviceStatusesNotificationMessage(deviceStatusesMsg: DeviceStatusesNotificationMessage): void {
    this.state.lastDeviceStatusesNotificationMessage = deviceStatusesMsg;
    const deviceStatusItems = this.createDeviceStatusItems(deviceStatusesMsg.body.deviceStatuses);
    this.signals.deviceStatusItems.set(deviceStatusItems);
  }

  createDeviceStatusItems(deviceStatuses: DeviceStatus[]): DeviceStatusItem[] {
    const deviceStatusItems: DeviceStatusItem[] = [];
    for (const deviceStatus of deviceStatuses) {
      const deviceStatusItem = {
        deviceName: this.getDeviceName(deviceStatus.deviceId),
        deviceStatus: deviceStatus,
        tariffName: this.getTariffName(deviceStatus.tariff),
      } as DeviceStatusItem;
      this.mergeCurrentDeviceStatusItemCustomProperties(deviceStatusItem);
      deviceStatusItems.push(deviceStatusItem);
    }
    return deviceStatusItems;
  }

  mergeCurrentDeviceStatusItemCustomProperties(deviceStatusItem: DeviceStatusItem): void {
    const deviceStatus = deviceStatusItem.deviceStatus;
    const currentStatusItems = this.signals.deviceStatusItems();
    const currentStatusItem = currentStatusItems.find(x => x.deviceStatus.deviceId === deviceStatus.deviceId);
    deviceStatusItem.isStartExpanded = deviceStatus.started ? false : !!currentStatusItem?.isStartExpanded;
    deviceStatusItem.selectedTariffItem = currentStatusItem?.selectedTariffItem || this.allEnabledTariffs[0];
  }

  getTariffName(tariffId?: number | null): string {
    if (!tariffId) {
      return '';
    }
    return this.allTariffsMap.get(tariffId)?.name || '';
  }

  getDeviceName(deviceId: number): string {
    return this.allDevicesMap.get(deviceId)?.name || ''
  }

  toggleStartExpanded(item: DeviceStatusItem): void {
    item.isStartExpanded = !item.isStartExpanded;
  }

  createSignals(): Signals {
    const signals: Signals = {
      deviceStatusItems: signal([]),
    };
    return signals;
  }

  createState(): ComputersStatusComponentState {
    const state: ComputersStatusComponentState = {
      lastDeviceStatusesNotificationMessage: null,
    };
    return state;
  }
}

interface Signals {
  deviceStatusItems: WritableSignal<DeviceStatusItem[]>;
}

interface DeviceStatusItem {
  deviceStatus: DeviceStatus;
  deviceName: string;
  tariffName: string;
  isStartExpanded: boolean;
  selectedTariffItem: Tariff;
}

interface ComputersStatusComponentState {
  lastDeviceStatusesNotificationMessage?: DeviceStatusesNotificationMessage | null;
}
