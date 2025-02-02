import {
  AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, DestroyRef, ElementRef, inject, OnInit, Signal, signal,
  ViewChild, WritableSignal
} from '@angular/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { translate, TranslocoDirective } from '@jsverse/transloco';
import { filter } from 'rxjs';

import {
  createCreateDeviceContinuationRequestMessage, createDeleteDeviceContinuationRequestMessage,
  CreateDeviceContinuationReplyMessage, createGetAllDevicesRequestMessage,
  createGetAllTariffsRequestMessage, createGetDeviceStatusesRequestMessage,
  createStartDeviceRequestMessage, createStopDeviceRequestMessage, createTransferDeviceRequestMessage,
  DeleteDeviceContinuationReplyMessage, Device, DeviceConnectivityItem, DeviceStatus,
  DeviceStatusesNotificationMessage, GetAllDevicesReplyMessage, GetAllTariffsReplyMessage,
  GetDeviceStatusesReplyMessage, NotificationMessageType,
  OperatorDeviceConnectivitiesNotificationMessage, StartDeviceReplyMessage,
  StopDeviceReplyMessage, Tariff, TariffType, TransferDeviceReplyMessage
} from '@ccs3-operator/messages';
import { InternalSubjectsService, MessageTransportService, NotificationType, NoYearDatePipe } from '@ccs3-operator/shared';
import { NotificationsService } from '@ccs3-operator/notifications';
import { IconName } from '@ccs3-operator/shared/types';
import { SecondsFormatterComponent } from '@ccs3-operator/seconds-formatter';
import { ExpandButtonComponent, ExpandButtonType } from '@ccs3-operator/expand-button';
import { MoneyFormatterComponent } from '@ccs3-operator/money-formatter';
import { TariffService } from './tariff.service';

@Component({
  selector: 'ccs3-op-computer-statuses',
  templateUrl: 'computer-statuses.component.html',
  styleUrls: ['computer-statuses.component.css'],
  standalone: true,
  imports: [
    NgClass, MatCardModule, MatButtonModule, MatExpansionModule, MatIconModule, MatInputModule, MatSelectModule,
    TranslocoDirective, NgTemplateOutlet, NoYearDatePipe, MoneyFormatterComponent,
    SecondsFormatterComponent, ExpandButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComputerStatusesComponent implements OnInit, AfterViewInit {
  readonly signals = this.createSignals();
  iconName = IconName;
  expandButtonType = ExpandButtonType;

  private readonly messageTransportSvc = inject(MessageTransportService);
  private readonly internalSubjectsSvc = inject(InternalSubjectsService);
  private readonly notificationsSvc = inject(NotificationsService);
  private readonly tariffSvc = inject(TariffService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly layoutGridRowsCssPropName = '--ccs3-op-computers-container-grid-rows';

  @ViewChild('computersContainer') computersContainerEl!: ElementRef<HTMLElement>;

  deviceStatusItemIdentity = (obj: DeviceStatusItem) => obj;

  ngOnInit(): void {
    this.internalSubjectsSvc.whenSignedIn().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.init());
  }

  ngAfterViewInit(): void {
    const currentLayoutRowsValue = parseInt(
      getComputedStyle(this.computersContainerEl.nativeElement)
        .getPropertyValue(this.layoutGridRowsCssPropName)
    );
    this.signals.layoutRowsCount.set(currentLayoutRowsValue);
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

  isCloseToEnd(item: DeviceStatusItem): boolean {
    if (item.deviceStatus.started && item.deviceStatus.remainingSeconds! < 180) {
      return true;
    }
    return false;
  }

  onDecreaseLayoutRows(): void {
    this.changeLayoutRows(-1);
  }

  onIncreaseLayoutRows(): void {
    this.changeLayoutRows(+1);
  }

  changeLayoutRows(changeValue: number): void {
    const currentValue = parseInt(getComputedStyle(this.computersContainerEl.nativeElement).getPropertyValue(this.layoutGridRowsCssPropName));
    let newValue = currentValue + changeValue;
    if (newValue < 1) {
      newValue = 1;
    }
    this.computersContainerEl.nativeElement.style.setProperty(this.layoutGridRowsCssPropName, newValue.toString());
    this.signals.layoutRowsCount.set(newValue);
  }

  onStart(item: DeviceStatusItem): void {
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
    this.messageTransportSvc.getMessageReceivedObservable().pipe(
      filter(msg => (msg.header.type as unknown as NotificationMessageType) === NotificationMessageType.deviceConnectivitiesNotification),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(deviceConnectivitiesMsg => this.processDeviceConnectivitiesNotificationMessage(deviceConnectivitiesMsg as unknown as OperatorDeviceConnectivitiesNotificationMessage));
  }

  processDeviceConnectivitiesNotificationMessage(msg: OperatorDeviceConnectivitiesNotificationMessage): void {
    const deviceStatusItems = this.signals.deviceStatusItems();
    for (const connectivityItem of msg.body.connectivityItems) {
      const statusItem = deviceStatusItems.find(x => x.deviceStatus.deviceId === connectivityItem.deviceId);
      if (statusItem) {
        statusItem.deviceConnectivity = connectivityItem;
      }
    }
    this.setDeviceStatusItems(deviceStatusItems);
  }

  processDeviceStatusesNotificationMessage(deviceStatusesMsg: DeviceStatusesNotificationMessage): void {
    this.signals.lastDeviceStatusesNotificationMessage.set(deviceStatusesMsg);
    const deviceStatusItems = this.createDeviceStatusItems(deviceStatusesMsg.body.deviceStatuses);
    this.setDeviceStatusItems(deviceStatusItems);
  }

  setDeviceStatusItems(deviceStatusItems: DeviceStatusItem[]): void {
    // Sort devices by name
    deviceStatusItems.sort((left, right) => left.deviceName?.localeCompare(right.deviceName));
    // If there is a change in started/stopped state of some devices, their selections for transfer might
    // become invalid. If for example some other device was started and transfer to device which was not started was selected,
    // this selection is now invalid, because the target device is now started
    this.refreshTransferToDeviceSelections(deviceStatusItems);
    this.signals.deviceStatusItems.set(deviceStatusItems);
    const notStartedDeviceStatusItems = deviceStatusItems.filter(x => !x.deviceStatus.started);
    this.signals.notStartedDeviceStatusItems.set(notStartedDeviceStatusItems);
    this.changeDetectorRef.markForCheck();
  }

  refreshTransferToDeviceSelections(deviceStatusItems: DeviceStatusItem[]): void {
    const startedDevicesIds = new Set<number>(deviceStatusItems.filter(x => x.deviceStatus.started).map(x => x.deviceStatus.deviceId));
    for (const deviceStatusItem of deviceStatusItems) {
      if (deviceStatusItem.selectedTransferToDeviceId && startedDevicesIds.has(deviceStatusItem.selectedTransferToDeviceId)) {
        // Some device has selected this device for transfer to, but the target device is not started
        // Clear source device transfer to selection since it is no longer valid
        deviceStatusItem.selectedTransferToDeviceId = null;
      }
    }
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
    const tariff = this.getTariff(deviceStatus.tariff);
    const deviceStatusItem = {
      deviceName: this.getDeviceName(deviceStatus.deviceId),
      deviceStatus: deviceStatus,
      tariffName: tariff?.name || '',
      tariffType: tariff?.type || '',
      tariffId: tariff?.id || 0,
    } as DeviceStatusItem;
    this.mergeCurrentDeviceStatusItemCustomProperties(deviceStatusItem);
    return deviceStatusItem;
  }


  mergeCurrentDeviceStatusItemCustomProperties(deviceStatusItem: DeviceStatusItem): void {
    const deviceStatus = deviceStatusItem.deviceStatus;
    const currentStatusItems = this.signals.deviceStatusItems();
    const currentStatusItem = currentStatusItems.find(x => x.deviceStatus.deviceId === deviceStatus.deviceId);
    deviceStatusItem.isActionsExpanded = deviceStatus.started ? false : !!currentStatusItem?.isActionsExpanded;
    deviceStatusItem.isOptionsExpanded = !deviceStatus.started ? false : !!currentStatusItem?.isOptionsExpanded;
    deviceStatusItem.selectedTariffItem = currentStatusItem?.selectedTariffItem || this.signals.allAvailableTariffs()[0];
    deviceStatusItem.stopNote = currentStatusItem?.stopNote;
    deviceStatusItem.selectedTransferToDeviceId = currentStatusItem?.selectedTransferToDeviceId;
    deviceStatusItem.selectedContinueWithTariffId = currentStatusItem?.selectedContinueWithTariffId;
    deviceStatusItem.deviceConnectivity = currentStatusItem?.deviceConnectivity;
    deviceStatusItem.optionsVisibility = currentStatusItem?.optionsVisibility ? currentStatusItem?.optionsVisibility : {
      continueWith: false, stop: false, transfer: false
    };
  }

  getTariff(tariffId?: number | null): Tariff | undefined {
    if (!tariffId) {
      return undefined;
    }
    return this.signals.allTariffsMap().get(tariffId);
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

  toggleActionsExpanded(item: DeviceStatusItem): void {
    item.isActionsExpanded = !item.isActionsExpanded;
  }

  toggleOptionsExpanded(item: DeviceStatusItem): void {
    item.isOptionsExpanded = !item.isOptionsExpanded;
    // Clear selections so they don't contain already invalid data
    // Like if target device for transfer was selected, then the section collapsed, then the device was started
    // and section expanded, since there is selection, the transfer button is enabled, but this selection is no longer valid,
    // because now the target device is started and cannot tranfer to it
    // item.selectedTransferToDeviceId = null;
  }

  onToggleOptionStopVisibility(item: DeviceStatusItem): void {
    item.optionsVisibility = {
      stop: !item.optionsVisibility.stop,
    };
  }

  onToggleOptionTransferVisibility(item: DeviceStatusItem): void {
    item.optionsVisibility = {
      transfer: !item.optionsVisibility.transfer,
    };
  }

  onToggleOptionContinueWithVisibility(item: DeviceStatusItem): void {
    item.optionsVisibility = {
      continueWith: !item.optionsVisibility.continueWith,
    };
  }

  onCancelContinuation(item: DeviceStatusItem): void {
    // TODO: Send message and wait for reply. Based on the reply success/failure cancel the continuation
    const requestMsg = createDeleteDeviceContinuationRequestMessage();
    requestMsg.body.deviceId = item.deviceStatus.deviceId;
    this.messageTransportSvc.sendAndAwaitForReply(requestMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(replyMsg => this.processDeleteDeviceContinuationReplyMessage(replyMsg));
  }

  processDeleteDeviceContinuationReplyMessage(replyMsg: DeleteDeviceContinuationReplyMessage): void {
    if (replyMsg.header.failure) {
      const msg = translate(`Can't remove continuation data`);
      this.notificationsSvc.show(NotificationType.error, msg, null, IconName.priority_high, replyMsg);
      return;
    }
    const msg = translate(`Continuation data removed`);
    this.notificationsSvc.show(NotificationType.success, msg, null, IconName.check, replyMsg);
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

  onTransferToChanged(transferToDeviceId: number, sourceItem: DeviceStatusItem): void {
    sourceItem.selectedTransferToDeviceId = transferToDeviceId;
  }

  onContinueWithChanged(tariffId: number, sourceItem: DeviceStatusItem): void {
    sourceItem.selectedContinueWithTariffId = tariffId;
  }

  onSetContinuation(item: DeviceStatusItem): void {
    if (!item.selectedContinueWithTariffId) {
      const msg = translate('Continue with tariff is not selected');
      this.notificationsSvc.show(NotificationType.warn, msg, null, IconName.priority_high, item);
      return;
    }
    const requestMsg = createCreateDeviceContinuationRequestMessage();
    requestMsg.body.deviceContinuation = {
      deviceId: item.deviceStatus.deviceId,
      // TODO: his does not need to be set by the client
      requestedAt: new Date().toISOString(),
      tariffId: item.selectedContinueWithTariffId,
      // TODO: This does not need to be set by the client
      userId: 0,
    };
    this.messageTransportSvc.sendAndAwaitForReply(requestMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(replyMsg => this.processCreateDeviceContinuationReplyMessage(replyMsg, item));
  }

  processCreateDeviceContinuationReplyMessage(replyMsg: CreateDeviceContinuationReplyMessage, item: DeviceStatusItem): void {
    if (replyMsg.header.failure) {
      const msg = translate(`Can't continue with the selected tariff`);
      this.notificationsSvc.show(NotificationType.warn, msg, null, IconName.priority_high, { replyMsg, deviceStatusItem: item });
      return;
    }
    const msg = translate(`Continuation saved`);
    this.notificationsSvc.show(NotificationType.success, msg, null, IconName.check, { replyMsg, deviceStatusItem: item });
  }

  onTransferToAnotherDevice(item: DeviceStatusItem): void {
    if (!item.selectedTransferToDeviceId) {
      const msg = translate('Target computer is not selected');
      this.notificationsSvc.show(NotificationType.warn, msg, null, IconName.priority_high, item);
      return;
    }
    const sourceDeviceId = item.deviceStatus.deviceId;
    const targetDeviceId = item.selectedTransferToDeviceId;
    const requestMsg = createTransferDeviceRequestMessage();
    requestMsg.body.sourceDeviceId = sourceDeviceId;
    requestMsg.body.targetDeviceId = targetDeviceId;
    this.messageTransportSvc.sendAndAwaitForReply(requestMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(replyMsg => this.processTransferDeviceReplyMessage(replyMsg));
  }

  processTransferDeviceReplyMessage(replyMsg: TransferDeviceReplyMessage): void {
    if (replyMsg.header.failure) {
      return;
    }
    // Refresh the two devices
    this.refreshDeviceStatusItem(replyMsg.body.sourceDeviceStatus);
    this.refreshDeviceStatusItem(replyMsg.body.targetDeviceStatus);
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
      allAvailableTariffs: signal([]),
      notStartedDeviceStatusItems: signal([]),
      layoutRowsCount: signal(5),
    };
    signals.allAvailableTariffs = computed(() => {
      const allTariffs = Array.from(this.signals.allTariffsMap().values());
      const allAvailableTariffs = allTariffs.filter(x => x.enabled && x.type !== TariffType.prepaid);
      return allAvailableTariffs;
    });
    return signals;
  }
}

interface Signals {
  deviceStatusItems: WritableSignal<DeviceStatusItem[]>;
  lastDeviceStatusesNotificationMessage: WritableSignal<DeviceStatusesNotificationMessage | null>;
  allDevicesMap: WritableSignal<Map<number, Device>>;
  allTariffsMap: WritableSignal<Map<number, Tariff>>;
  allAvailableTariffs: Signal<Tariff[]>;
  notStartedDeviceStatusItems: WritableSignal<DeviceStatusItem[]>;
  layoutRowsCount: WritableSignal<number>;
}

interface OptionsVisibility {
  stop?: boolean | null;
  transfer?: boolean | null;
  continueWith?: boolean | null;
}

interface DeviceStatusItem {
  deviceStatus: DeviceStatus;
  deviceName: string;
  tariffName: string;
  tariffType: TariffType;
  tariffId: number;
  isActionsExpanded: boolean;
  isOptionsExpanded: boolean;
  selectedTariffItem: Tariff;
  stopNote?: string | null;
  selectedTransferToDeviceId?: number | null;
  selectedContinueWithTariffId?: number | null;
  deviceConnectivity?: DeviceConnectivityItem | null;
  optionsVisibility: OptionsVisibility;
}
