import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, DestroyRef, ElementRef,
  inject, OnInit, Signal, signal, ViewChild, WritableSignal
} from '@angular/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { translate, TranslocoDirective } from '@jsverse/transloco';
import { filter, forkJoin, Observable } from 'rxjs';

import {
  createCreateDeviceContinuationRequestMessage, createDeleteDeviceContinuationRequestMessage,
  CreateDeviceContinuationReplyMessage, createGetAllDevicesRequestMessage,
  createGetAllTariffsRequestMessage, createGetCurrentShiftStatusRequestMessage,
  createGetDeviceStatusesRequestMessage, createStartDeviceRequestMessage, createStopDeviceRequestMessage,
  createTransferDeviceRequestMessage, DeleteDeviceContinuationReplyMessage, Device, DeviceConnectivityItem,
  DeviceStatus, DeviceStatusesNotificationMessage, GetAllDevicesReplyMessage, GetAllTariffsReplyMessage,
  GetDeviceStatusesReplyMessage, NotificationMessageType, OperatorDeviceConnectivitiesNotificationMessage,
  GetCurrentShiftStatusReplyMessage, StartDeviceReplyMessage, StopDeviceReplyMessage, Tariff, TariffType,
  TransferDeviceReplyMessage, createCompleteShiftRequestMessage, CompleteShiftReplyMessage,
  createGetAllAllowedDeviceObjectsRequestMessage, GetAllAllowedDeviceObjectsReplyMessage,
  createSetDeviceStatusNoteRequestMessage, SetDeviceStatusNoteReplyMessage,
  SignInInformationNotificationMessage, SignInInformationNotificationMessageBody,
  createGetAllDeviceGroupsRequestMessage, GetAllDeviceGroupsReplyMessage, DeviceGroup,
  GetProfileSettingsReplyMessage, UserProfileSettingName, createUpdateProfileSettingsRequestMessage,
  createRechargeTariffDurationRequestMessage, RechargeTariffDurationReplyMessage,
  createShutdownStoppedRequestMessage, ShutdownStoppedReplyMessage, createRestartDevicesRequestMessage,
  RestartDevicesReplyMessage, UserProfileSettingActionsAndOptionsButtonsPlacementsPossibleValue,
  createGetDeviceConnectivityDetailsRequestMessage, GetDeviceConnectivityDetailsReplyMessage,
} from '@ccs3-operator/messages';
import {
  InternalSubjectsService, MessageTransportService, NotificationType, NoYearDatePipe, PermissionName,
  PermissionsService, SorterService
} from '@ccs3-operator/shared';
import { NotificationsService } from '@ccs3-operator/notifications';
import { IconName } from '@ccs3-operator/shared/types';
import { SecondsFormatterComponent, SecondsFormatterService } from '@ccs3-operator/seconds-formatter';
import { BooleanIndicatorComponent } from '@ccs3-operator/boolean-indicator';
import { ExpandButtonComponent, ExpandButtonType } from '@ccs3-operator/expand-button';
import { MoneyFormatterComponent } from '@ccs3-operator/money-formatter';
import { TariffService } from './tariff.service';
import { ShiftStatusComponent } from './shift-status/shift-status.component';
import { ShiftCompletedEventArgs } from './shift-status/declarations';
import { RemainingTimeRankComponent } from './remaining-time-rank/remaining-time-rank.component';
import { RechargePrepaidTariffComponent } from './recharge-prepaid-tariff/recharge-prepaid-tariff.component';
import { BulkActionsComponent } from './bulk-actions/bulk-actions.component';
import { BulkActionData, BulkActionId, BulkActionSetNoteData, GlobalBulkActionData, GlobalBulkActionId } from './bulk-actions/declarations';
import { DeviceConnectivityDetails } from './internals';
import { ComputerStatusesService } from './computer-statuses.service';

@Component({
  selector: 'ccs3-op-computer-statuses',
  templateUrl: 'computer-statuses.component.html',
  styleUrls: ['computer-statuses.component.css'],
  imports: [
    NgClass, MatCardModule, MatButtonModule, MatExpansionModule, MatIconModule, MatInputModule, MatSelectModule,
    MatCheckboxModule, MatDividerModule, TranslocoDirective, NgTemplateOutlet, NoYearDatePipe, MoneyFormatterComponent,
    SecondsFormatterComponent, ExpandButtonComponent, ShiftStatusComponent, RemainingTimeRankComponent,
    RechargePrepaidTariffComponent, BulkActionsComponent, BooleanIndicatorComponent,
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
  private readonly permissionsSvc = inject(PermissionsService);
  private readonly secondsFormatterSvc = inject(SecondsFormatterService);
  private readonly sorterSvc = inject(SorterService);
  private readonly tariffSvc = inject(TariffService);
  private readonly computerStatusesSvc = inject(ComputerStatusesService);
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
    const layoutRowsCount = this.signals.layoutRowsCount();
    if (!layoutRowsCount) {
      const currentLayoutRowsValue = parseInt(
        getComputedStyle(this.computersContainerEl.nativeElement)
          .getPropertyValue(this.layoutGridRowsCssPropName)
      );
      this.signals.layoutRowsCount.set(currentLayoutRowsValue);
      this.setLayoutRowsCount(currentLayoutRowsValue);
    } else {
      this.setLayoutRowsCount(layoutRowsCount);
    }
  }

  init(): void {
    this.loadEntities();
    this.subscribeToSubjects();
    this.applyPermissions();
    // this.requestDeviceStatuses();
  }

  applyPermissions(): void {
    const canRechargePrepaidTariffs = this.permissionsSvc.hasPermission(PermissionName.tariffsRechargeDuration);
    this.signals.canRechargePrepaidTariffs.set(canRechargePrepaidTariffs);
  }

  onExecuteGlobalBulkAction(globalBulkActionData: GlobalBulkActionData): void {
    const globalActionId = globalBulkActionData.globalActionId;
    switch (globalActionId) {
      case GlobalBulkActionId.shutdownStopped:
        this.executeShutdownStoppedGlobalBulkAction();
        break;
    }
  }

  executeShutdownStoppedGlobalBulkAction(): void {
    const reqMsg = createShutdownStoppedRequestMessage();
    this.messageTransportSvc.sendAndAwaitForReply(reqMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(replyMsg => {
      const msg = replyMsg as ShutdownStoppedReplyMessage;
      if (msg.header.failure) {
        return;
      }
      const notificationMessage = translate('Shutdown message was sent to {{count}} computers', { count: msg.body.targetsCount });
      this.notificationsSvc.show(NotificationType.success, notificationMessage, null, IconName.check, replyMsg);
    });
  }

  onExecuteBulkAction(bulkActionData: BulkActionData): void {
    const actionId = bulkActionData.actionId;
    switch (actionId) {
      case BulkActionId.setNote:
        this.executeSetNoteBulkAction(bulkActionData);
        break;
      case BulkActionId.restart:
        this.executeRestartBulkAction(bulkActionData);
        break;
    }
  }

  executeRestartBulkAction(bulkActionData: BulkActionData): void {
    const reqMsg = createRestartDevicesRequestMessage();
    reqMsg.body.deviceIds = bulkActionData.deviceIds;
    this.messageTransportSvc.sendAndAwaitForReply(reqMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(replyMsg => {
      const msg = replyMsg as RestartDevicesReplyMessage;
      if (msg.header.failure) {
        return;
      }
      const notificationMessage = translate('Restart message was sent to {{count}} computers', { count: msg.body.targetsCount });
      this.notificationsSvc.show(NotificationType.success, notificationMessage, null, IconName.check, replyMsg);
    });
  }

  executeSetNoteBulkAction(bulkActionData: BulkActionData): void {
    const setNoteData = bulkActionData.data as BulkActionSetNoteData;
    const reqMsg = createSetDeviceStatusNoteRequestMessage();
    reqMsg.body.deviceIds = bulkActionData.deviceIds;
    reqMsg.body.note = setNoteData.note;
    this.messageTransportSvc.sendAndAwaitForReply(reqMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(replyMsg => {
      const msg = replyMsg as SetDeviceStatusNoteReplyMessage;
      if (msg.header.failure) {
        return;
      }
      this.notificationsSvc.show(NotificationType.success, translate('Note has been set'), null, IconName.check, replyMsg);
    });
  }

  onCompleteShift(args: ShiftCompletedEventArgs): void {
    const shiftStatus = this.signals.currentShiftReply()?.body.shiftStatus;
    const reqMsg = createCompleteShiftRequestMessage();
    reqMsg.body.shiftStatus = shiftStatus!;
    reqMsg.body.note = args.note;
    this.messageTransportSvc.sendAndAwaitForReply(reqMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(replyMsg => this.processCompleteShiftReplyMessage(replyMsg as CompleteShiftReplyMessage));
  }

  processCompleteShiftReplyMessage(replyMsg: CompleteShiftReplyMessage): void {
    if (!replyMsg?.header || replyMsg.header.failure) {
      return;
    }
    const msg = translate('The current shift has been completed');
    this.notificationsSvc.show(NotificationType.success, msg, null, IconName.check, replyMsg);
  }

  onRefreshCurrentShiftStatus(): void {
    this.setShiftStatusReplyMessage({ body: { shiftStatus: {} } } as GetCurrentShiftStatusReplyMessage);
    const reqMsg = createGetCurrentShiftStatusRequestMessage();
    this.messageTransportSvc.sendAndAwaitForReply(reqMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(replyMsg => this.processLoadCurrentShiftStatusReplyMessage(replyMsg as GetCurrentShiftStatusReplyMessage));
  }

  processLoadCurrentShiftStatusReplyMessage(replyMsg: GetCurrentShiftStatusReplyMessage): void {
    if (replyMsg.header.failure) {
      return;
    }
    // Sort items in summary by user
    this.sorterSvc.sortBy(replyMsg.body.shiftStatus.completedSummaryByUser, x => x.username);
    this.sorterSvc.sortBy(replyMsg.body.shiftStatus.runningSummaryByUser, x => x.username);
    // Empty usernames are no-user sessions (prepaid cards started by customers)
    const prepaidText = `~${translate('Customer')}~`;
    replyMsg.body.shiftStatus.completedSummaryByUser.forEach(x => x.username ||= prepaidText);
    replyMsg.body.shiftStatus.runningSummaryByUser.forEach(x => x.username ||= prepaidText);
    this.setShiftStatusReplyMessage(replyMsg);
  }

  setShiftStatusReplyMessage(replyMsg: GetCurrentShiftStatusReplyMessage): void {
    this.signals.currentShiftReply.set(replyMsg);
    this.changeDetectorRef.markForCheck();
  }

  // requestDeviceStatuses(): void {
  //   const getDeviceStatusesRequestMsg = createGetDeviceStatusesRequestMessage();
  //   this.messageTransportSvc.sendAndAwaitForReply(getDeviceStatusesRequestMsg).pipe(
  //     takeUntilDestroyed(this.destroyRef)
  //   ).subscribe(getDeviceStatusesReplyMsg => this.processGetDeviceStatusesReplyMessage(getDeviceStatusesReplyMsg as GetDeviceStatusesReplyMessage));
  // }

  isCloseToEnd(item: DeviceStatusItem): boolean {
    // TODO: Add this as profile configuration
    // TODO: Set this as a flag in the DeviceStatusItem
    const seconds = 180;
    if (item.deviceStatus.started && item.deviceStatus.remainingSeconds! < seconds) {
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
    // const currentValue = parseInt(getComputedStyle(this.computersContainerEl.nativeElement).getPropertyValue(this.layoutGridRowsCssPropName));
    const currentValue = this.signals.layoutRowsCount() || 10;
    let newValue = currentValue + changeValue;
    if (newValue < 1) {
      newValue = 1;
    }
    this.setLayoutRowsCount(newValue);
    const reqMsg = createUpdateProfileSettingsRequestMessage();
    reqMsg.body.profileSettings = [{
      name: UserProfileSettingName.computerStatusesLayoutRowsCount,
      value: newValue.toString(),
    }];
    this.messageTransportSvc.sendAndAwaitForReply(reqMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  onStart(item: DeviceStatusItem): void {
    const startDeviceRequestMsg = createStartDeviceRequestMessage();
    startDeviceRequestMsg.body.deviceId = item.deviceStatus.deviceId;
    startDeviceRequestMsg.body.tariffId = item.selectedTariffItem!.id;
    this.messageTransportSvc.sendAndAwaitForReply(startDeviceRequestMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(startDeviceReplyMsg => this.processStartDeviceReplyMessage(startDeviceReplyMsg as StartDeviceReplyMessage));
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
    this.setDeviceStatusItemsTransferToDevices(this.signals.deviceStatusItems());
  }

  loadEntities(): void {
    this.signals.isLoaded.set(false);
    const getAllDevicesRequestMsg = createGetAllDevicesRequestMessage();
    const getAllTariffsRequestMsg = createGetAllTariffsRequestMessage();
    const getAllAllowedDeviceObjectsRequestMsg = createGetAllAllowedDeviceObjectsRequestMessage();
    const getDeviceStatusesRequestMsg = createGetDeviceStatusesRequestMessage();
    const getAllDeviceGroupsRequestMsg = createGetAllDeviceGroupsRequestMessage();
    const observables: Observable<unknown>[] = [
      this.messageTransportSvc.sendAndAwaitForReply(getAllDevicesRequestMsg),
      this.messageTransportSvc.sendAndAwaitForReply(getAllTariffsRequestMsg),
      this.messageTransportSvc.sendAndAwaitForReply(getAllAllowedDeviceObjectsRequestMsg),
      this.messageTransportSvc.sendAndAwaitForReply(getDeviceStatusesRequestMsg),
      this.messageTransportSvc.sendAndAwaitForReply(getAllDeviceGroupsRequestMsg),
    ];
    forkJoin(observables).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(([
      getAllDevicesReplyMsg,
      getAllTariffsReplyMsg,
      getAllAllowedDeviceObjectsReplyMsg,
      getDeviceStatusesReplyMsg,
      getAllDeviceGroupsReplyMsg,
    ]) =>
      this.processEntitiesReplyMessages(
        getAllDevicesReplyMsg as GetAllDevicesReplyMessage,
        getAllTariffsReplyMsg as GetAllTariffsReplyMessage,
        getAllAllowedDeviceObjectsReplyMsg as GetAllAllowedDeviceObjectsReplyMessage,
        getDeviceStatusesReplyMsg as GetDeviceStatusesReplyMessage,
        getAllDeviceGroupsReplyMsg as GetAllDeviceGroupsReplyMessage,
      )
    );
    // this.messageTransportSvc.sendAndAwaitForReply(getAllDevicesRequestMsg).pipe(
    //   takeUntilDestroyed(this.destroyRef)
    // ).subscribe(allDevicesReplyMsg => this.processAllDevicesReplyMessage(allDevicesReplyMsg as GetAllDevicesReplyMessage));
    // this.messageTransportSvc.sendAndAwaitForReply(getAllTariffsRequestMsg).pipe(
    //   takeUntilDestroyed(this.destroyRef)
    // ).subscribe(allTariffsReplyMsg => this.processAllTariffsReplyMessage(allTariffsReplyMsg as GetAllTariffsReplyMessage));
  }

  processEntitiesReplyMessages(
    getAllDevicesReplyMsg: GetAllDevicesReplyMessage,
    getAllTariffsReplyMsg: GetAllTariffsReplyMessage,
    getAllAllowedDeviceObjectsReplyMsg: GetAllAllowedDeviceObjectsReplyMessage,
    getDeviceStatusesReplyMsg: GetDeviceStatusesReplyMessage,
    getAllDeviceGroupsReplyMsg: GetAllDeviceGroupsReplyMessage,
  ): void {
    // TODO: Check for any error before setting isLoaded signal and processing
    this.signals.isLoaded.set(true);
    this.processGetAllDeviceGroupsReplyMessage(getAllDeviceGroupsReplyMsg);
    this.processGetAllAllowedDeviceObjectsReplyMessage(getAllAllowedDeviceObjectsReplyMsg);
    this.processGetAllDevicesReplyMessage(getAllDevicesReplyMsg);
    this.processGetAllTariffsReplyMessage(getAllTariffsReplyMsg);
    this.processGetDeviceStatusesReplyMessage(getDeviceStatusesReplyMsg);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onRechargePrepaidTariffSelectedTariffChanged(tariff: Tariff): void {
    this.signals.rechargeTariffResultDescription.set(null);
  }

  onRechargePrepaidTariff(tariff: Tariff): void {
    const reqMsg = createRechargeTariffDurationRequestMessage();
    reqMsg.body.tariffId = tariff.id;
    this.messageTransportSvc.sendAndAwaitForReply(reqMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(replyMsg => this.processRechargeTariffDurationReplyMessage(replyMsg as RechargeTariffDurationReplyMessage));
  }

  processRechargeTariffDurationReplyMessage(replyMsg: RechargeTariffDurationReplyMessage): void {
    if (replyMsg.header.failure) {
      return;
    }
    const remainingSecondsComputedValue = this.secondsFormatterSvc.getComputedValue(replyMsg.body.remainingSeconds);
    const remainingTimeString = this.secondsFormatterSvc.computedValueResultToString(remainingSecondsComputedValue);
    const description = translate('New remaining time {{remainingTime}}', { remainingTime: remainingTimeString });
    this.notificationsSvc.show(
      NotificationType.success,
      translate('Tariff recharged'),
      description,
      IconName.check,
      replyMsg
    );
    this.signals.rechargeTariffResultDescription.set(description);
  }

  onTariffSelected(selectedTariff: Tariff, item: DeviceStatusItem): void {
    const canUseTariff = this.tariffSvc.canUseTariff(selectedTariff);
    if (!canUseTariff.canUse) {
      this.notificationsSvc.show(NotificationType.warn, translate(`The tariff '{{tariffName}}' can't be used right now`, { tariffName: selectedTariff.name }), `Current time is not in the tariff's From-To period`, IconName.priority_high, item);
    }
  }

  processGetAllDeviceGroupsReplyMessage(getAllDeviceGroupsReplyMsg: GetAllDeviceGroupsReplyMessage): void {
    if (getAllDeviceGroupsReplyMsg.header.failure) {
      return;
    }
    this.signals.getAllDeviceGroupsReplyMsg.set(getAllDeviceGroupsReplyMsg);
    const allDeviceGroups = getAllDeviceGroupsReplyMsg.body.deviceGroups;
    const allDeviceGroupsMap = new Map<number, DeviceGroup>(allDeviceGroups.map(x => ([x.id, x])));
    this.signals.allDeviceGroupsMap.set(allDeviceGroupsMap);
  }

  processGetAllAllowedDeviceObjectsReplyMessage(getAllAllowedDeviceObjectsReplyMsg: GetAllAllowedDeviceObjectsReplyMessage): void {
    this.signals.getAllAllowedDeviceObjectsReplyMsg.set(getAllAllowedDeviceObjectsReplyMsg);
  }

  processGetAllDevicesReplyMessage(getAllDevicesReplyMsg: GetAllDevicesReplyMessage): void {
    if (getAllDevicesReplyMsg.header.failure || !getAllDevicesReplyMsg.body.devices) {
      return;
    }
    this.signals.allDevices.set(getAllDevicesReplyMsg.body.devices);
    const mapItems: [number, Device][] = getAllDevicesReplyMsg.body.devices.filter(x => x.approved && x.enabled).map(device => ([device.id, device]));
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

  processGetAllTariffsReplyMessage(allTariffsReplyMsg: GetAllTariffsReplyMessage): void {
    if (!allTariffsReplyMsg.body.tariffs) {
      return;
    }
    const mapItems: [number, Tariff][] = allTariffsReplyMsg.body.tariffs.filter(x => x.enabled).map(tariff => [tariff.id, tariff]);
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
    this.internalSubjectsSvc.getSignInInformationNotificationMessage().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(notificationMsg => this.processSignInInformationNotificationMessage(notificationMsg as SignInInformationNotificationMessage));
    this.internalSubjectsSvc.getProfileSettingsReplyMessage().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(replyMsg => this.processGetProfileSettingsReplyMessage(replyMsg as GetProfileSettingsReplyMessage));
  }

  processGetProfileSettingsReplyMessage(replyMsg: GetProfileSettingsReplyMessage): void {
    if (!replyMsg?.header || replyMsg.header.failure) {
      return;
    }

    const settings = replyMsg.body.settings;

    const layoutRowsSetting = settings.find(x => x.name === UserProfileSettingName.computerStatusesLayoutRowsCount);
    if (layoutRowsSetting) {
      const rowsCount = +layoutRowsSetting.value!;
      if ((typeof rowsCount) === 'number' && rowsCount > 0) {
        this.setLayoutRowsCount(rowsCount);
      }
    }

    const actionsAndOptionsButtonsPlacementSettings = settings.find(x => x.name === UserProfileSettingName.actionsAndOptionsButtonsPlacement);
    const showAtEnd = actionsAndOptionsButtonsPlacementSettings?.value === UserProfileSettingActionsAndOptionsButtonsPlacementsPossibleValue.end;
    this.signals.showActionsAndOptionsAtTheStart.set(!showAtEnd);
    this.signals.showActionsAndOptionsAtTheEnd.set(showAtEnd);
  }

  setLayoutRowsCount(value: number): void {
    if (this.computersContainerEl) {
      this.computersContainerEl.nativeElement.style.setProperty(this.layoutGridRowsCssPropName, value.toString());
    }
    this.signals.layoutRowsCount.set(value);
  }

  processSignInInformationNotificationMessage(notificationMsg: SignInInformationNotificationMessage): void {
    this.signals.signInInformationNotificationMsgBody.set(notificationMsg.body);
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
    this.setDeviceStatusItemsTransferToDevices(deviceStatusItems);
    return deviceStatusItems;
  }

  createDeviceStatusItem(deviceStatus: DeviceStatus): DeviceStatusItem {
    const tariff = this.getTariff(deviceStatus.tariff);
    const allowedObjectsItem = this.signals.getAllAllowedDeviceObjectsReplyMsg();
    let allowedTariffs: Tariff[] = [];
    if (allowedObjectsItem?.body.allowedDeviceObjects) {
      const allowedDeviceObjects = allowedObjectsItem.body.allowedDeviceObjects.find(x => x.deviceId === deviceStatus.deviceId);
      if (allowedDeviceObjects) {
        const tariffs = allowedDeviceObjects.allowedTariffIds.map(x => this.getTariff(x));
        // Only tariffs which are not prepaid type - they cannot be started by users, only by customers
        // TODO: Remove prepaid tariffs filter if users are allowed to start devices on prepaid tariffs
        allowedTariffs = tariffs.filter(x => !!x).filter(x => x.type !== TariffType.prepaid);
      }
    }

    const deviceStatusItem = {
      deviceName: this.getDeviceName(deviceStatus.deviceId),
      device: this.getDevice(deviceStatus.deviceId),
      deviceStatus: deviceStatus,
      tariffName: tariff?.name || '',
      tariffType: tariff?.type || '',
      tariffId: tariff?.id || 0,
      tariff: tariff,
      allowedTariffs: allowedTariffs,
      allowedTransferToDevices: [] as Device[],
      deviceNote: deviceStatus.note || '',
    } as DeviceStatusItem;
    this.mergeCurrentDeviceStatusItemCustomProperties(deviceStatusItem);
    return deviceStatusItem;
  }

  setDeviceStatusItemsTransferToDevices(deviceStatusItems: DeviceStatusItem[]): void {
    // TODO: This needs to be refactored and simplified
    const allowedObjectsItem = this.signals.getAllAllowedDeviceObjectsReplyMsg();
    if (!allowedObjectsItem?.body.allowedDeviceObjects) {
      return;
    }
    const startedDeviceStatusItems = deviceStatusItems.filter(x => x.deviceStatus.started);
    for (const deviceStatusItem of startedDeviceStatusItems) {
      const allowedTransferToDevices: Device[] = [];
      const allowedDeviceObjects = allowedObjectsItem.body.allowedDeviceObjects.find(x => x.deviceId === deviceStatusItem.device.id);
      if (allowedDeviceObjects) {
        const allowedDevices = allowedDeviceObjects.allowedTransferTargetDeviceIds
          .map(x => this.getDevice(x))
          .filter(x => x.enabled && x.approved);
        // Now find which of the allowed devices are stopped and add only them
        for (const allowedDevice of allowedDevices) {
          if (allowedDevice.id !== deviceStatusItem.device.id) {
            const dsi = deviceStatusItems.find(x => x.device.id === allowedDevice.id);
            if (dsi && !dsi.deviceStatus.started) {
              // Device status for the allowed device is stopped - we can add it to transfer targets
              allowedTransferToDevices.push(allowedDevice);
            }
          }
        }
      }
      this.sorterSvc.sortBy(allowedTransferToDevices, x => x.name);
      deviceStatusItem.allowedTransferToDevices = allowedTransferToDevices;
    }
  }

  mergeCurrentDeviceStatusItemCustomProperties(deviceStatusItem: DeviceStatusItem): void {
    const deviceStatus = deviceStatusItem.deviceStatus;
    const currentStatusItems = this.signals.deviceStatusItems();
    const currentStatusItem = currentStatusItems.find(x => x.deviceStatus.deviceId === deviceStatus.deviceId);
    deviceStatusItem.isActionsExpanded = deviceStatus.started ? false : !!currentStatusItem?.isActionsExpanded;
    deviceStatusItem.isOptionsExpanded = !deviceStatus.started ? false : !!currentStatusItem?.isOptionsExpanded;
    deviceStatusItem.isDetailsExpanded = !!currentStatusItem?.isDetailsExpanded;
    deviceStatusItem.selectedTariffItem = currentStatusItem?.selectedTariffItem; // || this.signals.allAvailableTariffs()[0];
    deviceStatusItem.stopNote = currentStatusItem?.stopNote;
    deviceStatusItem.newDeviceNote = currentStatusItem?.newDeviceNote;
    deviceStatusItem.selectedTransferToDeviceId = currentStatusItem?.selectedTransferToDeviceId;
    deviceStatusItem.transferNote = currentStatusItem?.transferNote;
    deviceStatusItem.selectedContinueWithTariffId = currentStatusItem?.selectedContinueWithTariffId;
    deviceStatusItem.deviceConnectivity = currentStatusItem?.deviceConnectivity;
    deviceStatusItem.optionsVisibility = currentStatusItem?.optionsVisibility || {
      continueWith: false, stop: false, transfer: false
    };
    deviceStatusItem.detailsVisibility = currentStatusItem?.detailsVisibility || {
      deviceConnectivityDetails: false
    };
    deviceStatusItem.deviceConnectivityDetails = currentStatusItem?.deviceConnectivityDetails;
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
    return this.signals.allDevicesMap().get(deviceId)?.name || '';
  }

  getDevice(deviceId: number): Device {
    return this.signals.allDevicesMap().get(deviceId)!;
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

  toggleDetailsExpanded(item: DeviceStatusItem): void {
    item.isDetailsExpanded = !item.isDetailsExpanded;
  }

  onToggleDetailsDeviceConnectivityDetailsVisibility(item: DeviceStatusItem): void {
    item.detailsVisibility = {
      deviceConnectivityDetails: !item.detailsVisibility.deviceConnectivityDetails,
    };
    if (item.detailsVisibility.deviceConnectivityDetails) {
      this.loadDeviceConnectivity(item.device.id);
    }
  }

  onRefreshDeviceConnectivityDetails(item: DeviceStatusItem): void {
    // item.deviceConnectivityDetails = null;
    this.loadDeviceConnectivity(item.device.id);
  }

  loadDeviceConnectivity(deviceId: number): void {
    const reqMsg = createGetDeviceConnectivityDetailsRequestMessage();
    reqMsg.body.deviceId = deviceId;
    this.messageTransportSvc.sendAndAwaitForReply(reqMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(replyMsg => this.processGetDeviceConnectivityDetailsReplyMessage(replyMsg as GetDeviceConnectivityDetailsReplyMessage));
  }

  processGetDeviceConnectivityDetailsReplyMessage(replyMsg: GetDeviceConnectivityDetailsReplyMessage): void {
    if (replyMsg.header.failure) {
      return;
    }
    const deviceStatusItems = this.signals.deviceStatusItems();
    const deviceStatusItem = deviceStatusItems.find(x => x.device.id === replyMsg.body.deviceId);
    if (deviceStatusItem) {
      deviceStatusItem.deviceConnectivityDetails = this.computerStatusesSvc.createDeviceConnectivityDetailsItem(replyMsg.body);
      this.setDeviceStatusItems(deviceStatusItems);
    }
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
    ).subscribe(replyMsg => this.processDeleteDeviceContinuationReplyMessage(replyMsg as DeleteDeviceContinuationReplyMessage));
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

  onDeviceNoteChanged(ev: Event, item: DeviceStatusItem): void {
    const text = (ev.target as HTMLInputElement).value;
    item.newDeviceNote = text;
  }

  onSetDeviceNote(item: DeviceStatusItem): void {
    const reqMsg = createSetDeviceStatusNoteRequestMessage();
    reqMsg.body.deviceIds = [item.device.id];
    reqMsg.body.note = item.newDeviceNote || null;
    this.messageTransportSvc.sendAndAwaitForReply(reqMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(replyMsg => this.processSetDeviceStatusNoteReplyMessage(replyMsg as SetDeviceStatusNoteReplyMessage));
  }

  processSetDeviceStatusNoteReplyMessage(replyMsg: SetDeviceStatusNoteReplyMessage): void {
    if (replyMsg.header.failure) {
      return;
    }
    this.notificationsSvc.show(NotificationType.success, translate('Computer note was set'), null, IconName.check, replyMsg);
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
    ).subscribe(stopDeviceReplyMsg => this.processStopDeviceReplyMessage(stopDeviceReplyMsg as StopDeviceReplyMessage));
  }

  onTransferToChanged(transferToDeviceId: number, sourceItem: DeviceStatusItem): void {
    sourceItem.selectedTransferToDeviceId = transferToDeviceId;
  }

  onTransferNoteChanged(change: MatCheckboxChange, sourceItem: DeviceStatusItem): void {
    sourceItem.transferNote = change.checked;
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
    ).subscribe(replyMsg => this.processCreateDeviceContinuationReplyMessage(replyMsg as CreateDeviceContinuationReplyMessage, item));
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
    requestMsg.body.transferNote = item.transferNote;
    this.messageTransportSvc.sendAndAwaitForReply(requestMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(replyMsg => this.processTransferDeviceReplyMessage(replyMsg as TransferDeviceReplyMessage));
  }

  processTransferDeviceReplyMessage(replyMsg: TransferDeviceReplyMessage): void {
    if (replyMsg.header.failure) {
      return;
    }
    // Refresh the two devices
    this.refreshDeviceStatusItem(replyMsg.body.sourceDeviceStatus);
    this.refreshDeviceStatusItem(replyMsg.body.targetDeviceStatus);
    this.setDeviceStatusItemsTransferToDevices(this.signals.deviceStatusItems());
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
    this.setDeviceStatusItemsTransferToDevices(this.signals.deviceStatusItems());
  }

  createSignals(): Signals {
    const signals: Signals = {
      isLoaded: signal(false),
      deviceStatusItems: signal([]),
      deviceStatuses: signal([]),
      lastDeviceStatusesNotificationMessage: signal(null),
      allDevices: signal([]),
      allDevicesMap: signal(new Map<number, Device>()),
      allTariffs: signal([]),
      allTariffsMap: signal(new Map<number, Tariff>()),
      allAvailableTariffs: signal([]),
      allAvailablePrepaidTariffs: signal([]),
      layoutRowsCount: signal(null),
      currentShiftReply: signal(null),
      getAllAllowedDeviceObjectsReplyMsg: signal(null),
      signInInformationNotificationMsgBody: signal(null),
      getAllDeviceGroupsReplyMsg: signal(null),
      allDeviceGroupsMap: signal(new Map<number, DeviceGroup>()),
      canRechargePrepaidTariffs: signal(false),
      rechargeTariffResultDescription: signal(null),
      showActionsAndOptionsAtTheStart: signal(true),
      showActionsAndOptionsAtTheEnd: signal(false),
    };
    signals.allAvailablePrepaidTariffs = computed(() => {
      const allTariffs = Array.from(this.signals.allTariffsMap().values());
      const allAvailablePrepaidTariffs = allTariffs.filter(x => x.enabled && x.type === TariffType.prepaid);
      const sortedTariffs = [...allAvailablePrepaidTariffs];
      this.sorterSvc.sortBy(sortedTariffs, x => x.name);
      return sortedTariffs;
    });
    signals.allAvailableTariffs = computed(() => {
      const allTariffs = Array.from(this.signals.allTariffsMap().values());
      const allAvailableTariffs = allTariffs.filter(x => x.enabled && x.type !== TariffType.prepaid);
      return allAvailableTariffs;
    });
    signals.allTariffs = computed(() => {
      const allTariffs = Array.from(this.signals.allTariffsMap().values());
      return allTariffs;
    });
    signals.deviceStatuses = computed(() => {
      const deviceStatusItems = this.signals.deviceStatusItems();
      const deviceStatuses = deviceStatusItems.map(x => x.deviceStatus);
      return deviceStatuses;
    });
    return signals;
  }
}

interface Signals {
  isLoaded: WritableSignal<boolean>;
  deviceStatusItems: WritableSignal<DeviceStatusItem[]>;
  deviceStatuses: Signal<DeviceStatus[]>;
  lastDeviceStatusesNotificationMessage: WritableSignal<DeviceStatusesNotificationMessage | null>;
  allDevices: WritableSignal<Device[]>;
  allDevicesMap: WritableSignal<Map<number, Device>>;
  allTariffs: Signal<Tariff[]>;
  allTariffsMap: WritableSignal<Map<number, Tariff>>;
  allAvailableTariffs: Signal<Tariff[]>;
  allAvailablePrepaidTariffs: Signal<Tariff[]>;
  // transferrableDeviceStatusItems: WritableSignal<DeviceStatusItem[]>;
  layoutRowsCount: WritableSignal<number | null>;
  currentShiftReply: WritableSignal<GetCurrentShiftStatusReplyMessage | null>;
  getAllAllowedDeviceObjectsReplyMsg: WritableSignal<GetAllAllowedDeviceObjectsReplyMessage | null>;
  signInInformationNotificationMsgBody: WritableSignal<SignInInformationNotificationMessageBody | null>;
  getAllDeviceGroupsReplyMsg: WritableSignal<GetAllDeviceGroupsReplyMessage | null>;
  allDeviceGroupsMap: WritableSignal<Map<number, DeviceGroup>>;
  canRechargePrepaidTariffs: WritableSignal<boolean>;
  rechargeTariffResultDescription: WritableSignal<string | null>;
  showActionsAndOptionsAtTheStart: WritableSignal<boolean>;
  showActionsAndOptionsAtTheEnd: WritableSignal<boolean>;
}

interface DetailsVisibility {
  deviceConnectivityDetails: boolean | undefined | null;
}

interface OptionsVisibility {
  stop?: boolean | null;
  transfer?: boolean | null;
  continueWith?: boolean | null;
}

interface DeviceStatusItem {
  deviceStatus: DeviceStatus;
  deviceName: string;
  device: Device;
  tariff?: Tariff;
  tariffName: string;
  tariffType: TariffType;
  tariffId: number;
  isActionsExpanded: boolean;
  isOptionsExpanded: boolean;
  isDetailsExpanded: boolean;
  selectedTariffItem?: Tariff | null;
  stopNote?: string | null;
  deviceNote?: string | null;
  newDeviceNote?: string | null;
  selectedTransferToDeviceId?: number | null;
  transferNote?: boolean | null;
  selectedContinueWithTariffId?: number | null;
  deviceConnectivity?: DeviceConnectivityItem | null;
  optionsVisibility: OptionsVisibility;
  detailsVisibility: DetailsVisibility;
  deviceConnectivityDetails?: DeviceConnectivityDetails | null;
  allowedTariffs?: Tariff[] | null;
  allowedTransferToDevices?: Device[] | null;
}
