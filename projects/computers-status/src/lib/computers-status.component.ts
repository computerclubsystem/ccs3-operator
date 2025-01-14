import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, DestroyRef, inject, OnInit, Signal, signal,
  WritableSignal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { translate, TranslocoDirective } from '@jsverse/transloco';
import { filter } from 'rxjs';

import {
  createGetAllDevicesRequestMessage, createGetAllTariffsRequestMessage, createGetDeviceStatusesRequestMessage,
  createStartDeviceRequestMessage, createStopDeviceRequestMessage, Device, DeviceStatus, DeviceStatusesNotificationMessage, GetAllDevicesReplyMessage,
  GetAllTariffsReplyMessage, GetDeviceStatusesReplyMessage, MessageType, NotificationMessageType, StartDeviceReplyMessage,
  StopDeviceReplyMessage, Tariff, TariffType
} from '@ccs3-operator/messages';
import { InternalSubjectsService, MessageTransportService, NoYearDatePipe, SecondsToTimePipe } from '@ccs3-operator/shared';
import { NotificationsService, NotificationType } from '@ccs3-operator/notifications';
import { IconName } from '@ccs3-operator/shared/types';
import { MoneyFormatterComponent } from '@ccs3-operator/money-formatter';
import { TariffService } from './tariff.service';

@Component({
  selector: 'ccs3-op-computers-status',
  standalone: true,
  imports: [
    MatCardModule, MatButtonModule, MatInputModule, MatSelectModule, TranslocoDirective,
    NgTemplateOutlet, SecondsToTimePipe, NoYearDatePipe, MoneyFormatterComponent,
  ],
  templateUrl: 'computers-status.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComputersStatusComponent implements OnInit {
  readonly signals = this.createSignals();
  private readonly messageTransportSvc = inject(MessageTransportService);
  private readonly internalSubjectsSvc = inject(InternalSubjectsService);
  private readonly notificationsSvc = inject(NotificationsService);
  private readonly tariffSvc = inject(TariffService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  deviceStatusItemIdentity = (obj: DeviceStatusItem) => obj;

  ngOnInit(): void {
    this.internalSubjectsSvc.whenSignedIn().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.init());
  }

  init(): void {
    this.loadEntities();
    this.subscribeToSubjects();
    this.requestDeviceStatuses();
  }

  requestDeviceStatuses(): void {
    const getDeviceStatusesRequestMsg = createGetDeviceStatusesRequestMessage();
    this.messageTransportSvc.sendAndAwaitForReply(getDeviceStatusesRequestMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(getDeviceStatusesReplyMsg => this.processGetDeviceStatusesReplyMessage(getDeviceStatusesReplyMsg));
  }

  onStart(item: DeviceStatusItem): void {
    // TODO: Starting on tariff that cannot be used right now should fail on the server
    // const canUseTariff = this.computersStatusSvc.canUseTariff(item.selectedTariffItem);
    // if (canUseTariff.canUse) {
    // } else {
    //   return;
    // }
    const startDeviceRequestMsg = createStartDeviceRequestMessage();
    startDeviceRequestMsg.body.deviceId = item.deviceStatus.deviceId;
    startDeviceRequestMsg.body.tariffId = item.selectedTariffItem.id;
    this.messageTransportSvc.sendAndAwaitForReply(startDeviceRequestMsg).pipe(
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
      return;
    }
    this.refreshDeviceStatusItem(startDeviceReplyMsg.body.deviceStatus);
  }

  loadEntities(): void {
    const getAllDevicesRequestMsg = createGetAllDevicesRequestMessage();
    this.messageTransportSvc.sendAndAwaitForReply(getAllDevicesRequestMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(allDevicesReplyMsg => this.processAllDevicesReplyMessage(allDevicesReplyMsg));
    const getAllTariffsRequestMsg = createGetAllTariffsRequestMessage();
    this.messageTransportSvc.sendAndAwaitForReply(getAllTariffsRequestMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(allTariffsReplyMsg => this.processAllTariffsReplyMessage(allTariffsReplyMsg));
  }

  onTariffSelected(selectedTariff: Tariff, item: DeviceStatusItem): void {
    const canUseTariff = this.tariffSvc.canUseTariff(selectedTariff);
    if (!canUseTariff.canUse) {
      this.notificationsSvc.show(NotificationType.warn, translate(`The tariff '{{tariffName}}' can't be used right now`, { tariffName: selectedTariff.name }), `Current time is not in the tariff's From-To period`, IconName.priority_high, item);
    }
  }

  processAllDevicesReplyMessage(allDevicesReplyMsg: GetAllDevicesReplyMessage): void {
    if (!allDevicesReplyMsg.body.devices) {
      return;
    }
    const mapItems: [number, Device][] = allDevicesReplyMsg.body.devices.map(device => ([device.id, device]));
    this.signals.allDevicesMap.set(new Map<number, Device>(mapItems));
    // When all devices are available, we must refresh the signals.deviceStatusItems to show device names
    this.refreshDeviceStatusItemsWithLastNotificationMessage();
  }

  refreshDeviceStatusItem(deviceStatus: DeviceStatus): void {
    const updatedDeviceStatusItem = this.createDeviceStatusItems([deviceStatus])[0];
    const currentDeviceStatusItems = this.signals.deviceStatusItems();
    const index = currentDeviceStatusItems.findIndex(x => x.deviceStatus.deviceId === deviceStatus.deviceId);
    if (index >= 0) {
      currentDeviceStatusItems[index] = updatedDeviceStatusItem;
      this.setDeviceStatusItems(currentDeviceStatusItems);
    }
  }

  refreshDeviceStatusItemsWithLastNotificationMessage(): void {
    const lastDeviceStatusesMsg = this.signals.lastDeviceStatusesNotificationMessage();
    if (lastDeviceStatusesMsg) {
      const deviceStatusItems = this.createDeviceStatusItems(lastDeviceStatusesMsg.body.deviceStatuses);
      this.setDeviceStatusItems(deviceStatusItems);
    }
  }

  processAllTariffsReplyMessage(allTariffsReplyMsg: GetAllTariffsReplyMessage): void {
    if (!allTariffsReplyMsg.body.tariffs) {
      return;
    }
    const mapItems: [number, Tariff][] = allTariffsReplyMsg.body.tariffs.map(tariff => [tariff.id, tariff]);
    this.signals.allTariffsMap.set(new Map<number, Tariff>(mapItems));
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
    this.signals.lastDeviceStatusesNotificationMessage.set(deviceStatusesMsg);
    const deviceStatusItems = this.createDeviceStatusItems(deviceStatusesMsg.body.deviceStatuses);
    this.setDeviceStatusItems(deviceStatusItems);
  }

  setDeviceStatusItems(deviceStatusItems: DeviceStatusItem[]): void {
    this.signals.deviceStatusItems.set(deviceStatusItems);
    this.changeDetectorRef.markForCheck();
  }

  createDeviceStatusItems(deviceStatuses: DeviceStatus[]): DeviceStatusItem[] {
    const deviceStatusItems: DeviceStatusItem[] = [];
    for (const deviceStatus of deviceStatuses) {
      const deviceStatusItem = this.createDeviceStatusItem(deviceStatus);
      deviceStatusItems.push(deviceStatusItem);
    }
    return deviceStatusItems;
  }

  createDeviceStatusItem(deviceStatus: DeviceStatus): DeviceStatusItem {
    const deviceStatusItem = {
      deviceName: this.getDeviceName(deviceStatus.deviceId),
      deviceStatus: deviceStatus,
      tariffName: this.getTariffName(deviceStatus.tariff),
    } as DeviceStatusItem;
    this.mergeCurrentDeviceStatusItemCustomProperties(deviceStatusItem);
    return deviceStatusItem;
  }


  mergeCurrentDeviceStatusItemCustomProperties(deviceStatusItem: DeviceStatusItem): void {
    const deviceStatus = deviceStatusItem.deviceStatus;
    const currentStatusItems = this.signals.deviceStatusItems();
    const currentStatusItem = currentStatusItems.find(x => x.deviceStatus.deviceId === deviceStatus.deviceId);
    deviceStatusItem.isStartExpanded = deviceStatus.started ? false : !!currentStatusItem?.isStartExpanded;
    deviceStatusItem.isStopExpanded = !deviceStatus.started ? false : !!currentStatusItem?.isStopExpanded;
    deviceStatusItem.selectedTariffItem = currentStatusItem?.selectedTariffItem || this.signals.allEnabledTariffs()[0];
    deviceStatusItem.stopNote = currentStatusItem?.stopNote;
  }

  getTariffName(tariffId?: number | null): string {
    if (!tariffId) {
      return '';
    }
    return this.signals.allTariffsMap().get(tariffId)?.name || '';
  }

  getDeviceName(deviceId: number): string {
    return this.signals.allDevicesMap().get(deviceId)?.name || ''
  }

  toggleStartExpanded(item: DeviceStatusItem): void {
    item.isStartExpanded = !item.isStartExpanded;
  }

  toggleStopExpanded(item: DeviceStatusItem): void {
    item.isStopExpanded = !item.isStopExpanded;
  }

  onStopNoteChanged(ev: Event, item: DeviceStatusItem): void {
    const text = (ev.target as HTMLTextAreaElement).value;
    item.stopNote = text;
  }

  onStopDevice(item: DeviceStatusItem): void {
    const requestMsg = createStopDeviceRequestMessage();
    requestMsg.body.deviceId = item.deviceStatus.deviceId;
    requestMsg.body.note = item.stopNote;
    this.messageTransportSvc.sendAndAwaitForReply(requestMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(stopDeviceReplyMsg => this.processStopDeviceReplyMessage(stopDeviceReplyMsg));
  }

  processStopDeviceReplyMessage(stopDeviceReplyMsg: StopDeviceReplyMessage): void {
    if (stopDeviceReplyMsg.header.failure) {
      return;
    }

    const deviceStatusItems = this.signals.deviceStatusItems();
    const currentDeviceStatusItemIndex = deviceStatusItems.findIndex(x => x.deviceStatus.deviceId === stopDeviceReplyMsg.body.deviceStatus.deviceId);
    if (currentDeviceStatusItemIndex >= 0) {
      const newDeviceStatusItem = this.createDeviceStatusItem(stopDeviceReplyMsg.body.deviceStatus);
      deviceStatusItems.splice(currentDeviceStatusItemIndex, 1, newDeviceStatusItem);
      this.setDeviceStatusItems(deviceStatusItems);
    }
  }

  createSignals(): Signals {
    const signals: Signals = {
      deviceStatusItems: signal([]),
      lastDeviceStatusesNotificationMessage: signal(null),
      allDevicesMap: signal(new Map<number, Device>()),
      allTariffsMap: signal(new Map<number, Tariff>()),
      allEnabledTariffs: signal([]),
    };
    signals.allEnabledTariffs = computed(() => {
      const allTariffs = this.signals.allTariffsMap().values();
      return Array.from(allTariffs).filter(tariff => tariff.enabled);
    });
    return signals;
  }
}

interface Signals {
  deviceStatusItems: WritableSignal<DeviceStatusItem[]>;
  lastDeviceStatusesNotificationMessage: WritableSignal<DeviceStatusesNotificationMessage | null>;
  allDevicesMap: WritableSignal<Map<number, Device>>;
  allTariffsMap: WritableSignal<Map<number, Tariff>>;
  allEnabledTariffs: Signal<Tariff[]>;
}

interface DeviceStatusItem {
  deviceStatus: DeviceStatus;
  deviceName: string;
  tariffName: string;
  isStartExpanded: boolean;
  isStopExpanded: boolean;
  selectedTariffItem: Tariff;
  stopNote?: string | null;
}
