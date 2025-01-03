import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { translate, TranslocoDirective } from '@jsverse/transloco';
import { filter } from 'rxjs';

import { createGetAllDevicesRequestMessage, createGetAllTariffsRequestMessage, createStartDeviceRequestMessage, Device, DeviceStatus, DeviceStatusesNotificationMessage, GetAllDevicesReplyMessage, GetAllTariffsReplyMessage, MessageType, NotificationMessageType, StartDeviceReplyMessage, Tariff, TariffType } from '@ccs3-operator/messages';
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
  private readonly messageTransportSvc = inject(MessageTransportService);
  private readonly internalSubjectsSvc = inject(InternalSubjectsService);
  private readonly notificationsSvc = inject(NotificationsService);
  private readonly destroyRef = inject(DestroyRef);
  private allDevicesMap = new Map<number, Device>();
  private allDevices: Device[] = [];
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
  }

  onStart(item: DeviceStatusItem): void {
    const startDeviceRequestMsg = createStartDeviceRequestMessage();
    startDeviceRequestMsg.body.deviceId = item.deviceStatus.deviceId;
    startDeviceRequestMsg.body.tariffId = item.selectedTariffItem.id;
    this.messageTransportSvc.sendAndAwaitForReplyByType(startDeviceRequestMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(startDeviceReplyMsg => this.processStartDeviceReplyMessage(startDeviceReplyMsg));
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
  }

  processAllTariffsReplyMessage(allTariffsReplyMsg: GetAllTariffsReplyMessage): void {
    if (!allTariffsReplyMsg.body.tariffs) {
      return;
    }
    this.allTariffsMap = new Map<number, Tariff>(allTariffsReplyMsg.body.tariffs.map(tariff => [tariff.id, tariff]));
    this.allEnabledTariffs = allTariffsReplyMsg.body.tariffs.filter(x => x.enabled);
  }

  subscribeToSubjects(): void {
    this.messageTransportSvc.getMessageReceivedObservable().pipe(
      filter(msg => (msg.header.type as unknown as NotificationMessageType) === NotificationMessageType.deviceStatusesNotification),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(deviceStatusesMsg => this.processDeviceStatusesNotificationMessage(deviceStatusesMsg as unknown as DeviceStatusesNotificationMessage));
  }

  processDeviceStatusesNotificationMessage(deviceStatusesMsg: DeviceStatusesNotificationMessage): void {
    const deviceStatusItems: DeviceStatusItem[] = [];
    for (const deviceStatus of deviceStatusesMsg.body.deviceStatuses) {
      const deviceStatusItem = {
        deviceName: this.getDeviceName(deviceStatus.deviceId),
        deviceStatus: deviceStatus,
        tariffName: this.getTariffName(deviceStatus.tariff),
      } as DeviceStatusItem;
      this.mergeCurrentDeviceStatusItemCustomProperties(deviceStatusItem);
      deviceStatusItems.push(deviceStatusItem);
    }
    this.signals.deviceStatusItems.set(deviceStatusItems);
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
