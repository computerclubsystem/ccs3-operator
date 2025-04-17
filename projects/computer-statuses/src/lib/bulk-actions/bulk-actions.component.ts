import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, output, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { translate, TranslocoDirective } from '@jsverse/transloco';

import { GroupingService, SorterService } from '@ccs3-operator/shared';
import { Device, DeviceGroup, DeviceStatus, Tariff } from '@ccs3-operator/messages';
import { IconName, IdWithName } from '@ccs3-operator/shared/types';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { ConfirmationComponentData } from './confirmation/declarations';
import { BulkActionData, BulkActionId, BulkActionSetNoteData, GlobalBulkActionData, GlobalBulkActionId } from './declarations';

@Component({
  selector: 'ccs3-op-bulk-actions',
  templateUrl: 'bulk-actions.component.html',
  imports: [
    MatCardModule, MatExpansionModule, MatListModule, MatButtonModule, MatSelectModule, MatFormFieldModule, MatIconModule,
    MatInputModule, MatDividerModule, TranslocoDirective
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulkActionsComponent implements OnInit {
  allDevicesMap = input<Map<number, Device>>();
  allTariffsMap = input<Map<number, Tariff>>();
  allDeviceGroupsMap = input<Map<number, DeviceGroup>>();
  deviceStatuses = input<DeviceStatus[]>();
  execute = output<BulkActionData>();
  executeGlobal = output<GlobalBulkActionData>();

  readonly globalBulkActions = this.createGlobalBulkActionItems();
  readonly bulkActions = this.createBulkActionItems();
  readonly signals = this.createSignals();
  readonly bulkActionId = BulkActionId;
  readonly iconName = IconName;

  selectedGlobalActionItem?: ItemWithIcon<GlobalBulkActionId> | null;

  private readonly groupingSvc = inject(GroupingService);
  private readonly sorterSvc = inject(SorterService);
  private readonly matDialog = inject(MatDialog);
  private deviceGroupSelectedDevicesMap = new Map<number, number[]>();
  private deviceGroupSelectedActionMap = new Map<number | undefined | null, BulkActionId>();
  private deviceGroupNoteMap = new Map<number | undefined | null, string>();

  ngOnInit(): void {
    this.init();
  }

  init(): void {
    //
  }

  onDevicesSelectionChanged(deviceGroupItem: GroupWithDevices, change: MatSelectionListChange): void {
    const selectedDeviceIds = change.source.selectedOptions.selected.map(x => x.value as number);
    this.deviceGroupSelectedDevicesMap.set(deviceGroupItem.deviceGroup.id, selectedDeviceIds);
  }

  onGroupActionChanged(deviceGroupItem: GroupWithDevices, actionId: BulkActionId): void {
    this.deviceGroupSelectedActionMap.set(deviceGroupItem.deviceGroup.id, actionId);
  }

  onNoteChanged(deviceGroupItem: GroupWithDevices, ev: Event): void {
    const inputEv = ev as InputEvent;
    const noteText = (inputEv.target as HTMLInputElement).value;
    this.deviceGroupNoteMap.set(deviceGroupItem.deviceGroup.id, noteText);
  }

  onGlobalActionChanged(globalActionItem: ItemWithIcon<GlobalBulkActionId>): void {
    this.selectedGlobalActionItem = globalActionItem;
  }

  onExecuteGlobalAction(): void {
    if (!this.selectedGlobalActionItem) {
      return;
    }
    const confirmationMessage = translate(`Do you want to execute global action '{{action}}'`, {
      action: this.selectedGlobalActionItem.name,
    });
    const confirmationComponentData: ConfirmationComponentData = {
      title: translate(`Global bulk action '{{action}}'`, { action: this.selectedGlobalActionItem.name }),
      message: confirmationMessage,
    };
    this.matDialog.open(ConfirmationComponent, {
      data: confirmationComponentData,
    }).afterClosed().subscribe(dlgResult => dlgResult && this.processGlobalBulkAction(this.selectedGlobalActionItem!.id));
  }

  processGlobalBulkAction(globalActionId: GlobalBulkActionId): void {
    const globalBulkData: GlobalBulkActionData = {
      globalActionId: globalActionId,
    };
    // TODO: Use switch when global actions support settings
    // switch (globalActionId) {
    //   case GlobalBulkActionId.shutdownStopped:
    //     break;
    //   case GlobalBulkActionId.restartStopped:
    //     break;
    // }
    this.executeGlobal.emit(globalBulkData);
  }

  onExecuteAction(deviceGroupItem: GroupWithDevices): void {
    const groupId = deviceGroupItem.deviceGroup.id;
    const actionId = this.deviceGroupSelectedActionMap.get(groupId);
    if (!actionId) {
      return;
    }
    const deviceIds = this.deviceGroupSelectedDevicesMap.get(groupId);
    if (!deviceIds?.length) {
      return;
    }

    const deviceNames: string[] = Array.from(this.allDevicesMap()!.values()).filter(x => deviceIds.includes(x.id)).map(x => x.name!);
    const deviceNamesText = deviceNames.join(', ');
    const actionName = this.bulkActions.find(x => x.id === actionId)!.name;
    const confirmationMessage = translate(`Do you want to execute action '{{action}}' on devices {{names}}`, {
      action: actionName,
      names: deviceNamesText
    });
    const confirmationComponentData: ConfirmationComponentData = {
      title: translate(`Bulk action '{{action}}'`, { action: actionName }),
      message: confirmationMessage,
    };
    this.matDialog.open(ConfirmationComponent, {
      data: confirmationComponentData,
    }).afterClosed().subscribe(dlgResult => dlgResult && this.processBulkAction(deviceGroupItem, deviceIds, actionId));
  }

  processBulkAction(deviceGroupItem: GroupWithDevices, deviceIds: number[], actionId: BulkActionId): void {
    const groupId = deviceGroupItem.deviceGroup.id;
    const bulkData: BulkActionData = {
      actionId: actionId,
      deviceIds: deviceIds,
    };
    switch (actionId) {
      case BulkActionId.setNote:
        bulkData.data = this.createSetNoteData(groupId);
        break;
      case BulkActionId.restart:
        bulkData.data = null;
        break;
      case BulkActionId.shutdown:
        bulkData.data = null;
        break;
    }
    this.execute.emit(bulkData);
  }

  createSetNoteData(deviceGroupId: number | undefined | null): BulkActionSetNoteData {
    const note = this.deviceGroupNoteMap.get(deviceGroupId);
    const setNoteData: BulkActionSetNoteData = {
      note: note || null,
    };
    return setNoteData;
  }

  getGlobalActionOptionsVisibility(globalActionItem: ItemWithIcon<GlobalBulkActionId>): GlobalActionOptionsVisibility {
    // TODO: Implement when global actions need settings
    switch (globalActionItem.id) {
      case GlobalBulkActionId.shutdownStopped:
        break;
      // case GlobalBulkActionId.restartStopped:
      //   break;
    }
    return {};
  }

  getActionOptionsVisibility(groupId: number | undefined | null): ActionOptionsVisibility {
    const groupSelectedActionId = this.deviceGroupSelectedActionMap.get(groupId);
    if (!groupSelectedActionId) {
      return {};
    }
    switch (groupSelectedActionId) {
      case BulkActionId.setNote:
        return { setNote: true };
      case BulkActionId.restart:
        return { restart: true };
      case BulkActionId.shutdown:
        return { shutdown: true };
      // case BulkActionId.start:
      //   return { start: true };
    }
    return {};
  }

  createSignals(): Signals {
    const groupsWithDevices = computed(() => {
      const devicesMap = this.allDevicesMap();
      const deviceGroupsMap = this.allDeviceGroupsMap();
      const deviceStatuses = this.deviceStatuses();
      if (devicesMap && deviceGroupsMap && deviceStatuses) {
        return this.createGroupsWithDevices(
          devicesMap,
          deviceGroupsMap,
          deviceStatuses,
        );
      } else {
        return [];
      }
    });
    const signals: Signals = {
      groupsWithDevices: groupsWithDevices,
    };
    return signals;
  }

  createGroupsWithDevices(devicesMap: Map<number, Device>, deviceGroupsMap: Map<number, DeviceGroup>, deviceStatuses: DeviceStatus[]): GroupWithDevices[] {
    const activeDevices = Array.from(devicesMap.values());
    const result: GroupWithDevices[] = [];
    const groupedDevices = this.groupingSvc.groupBy(activeDevices, x => x.deviceGroupId);
    for (const grp of groupedDevices) {
      const deviceGroupId = grp.key;

      if (deviceGroupId) {
        // Devices in group
        result.push({
          deviceGroup: deviceGroupsMap.get(deviceGroupId)!,
          devicesWithStatuses: this.createDevicesWithStatuses(grp.items, deviceStatuses),
        });
      } else {
        // Devices not in group
        result.push({
          deviceGroup: { id: 0, name: '', enabled: true, restrictDeviceTransfers: false },
          devicesWithStatuses: this.createDevicesWithStatuses(grp.items, deviceStatuses),
        });
      }
    }
    this.sorterSvc.sortBy(result, x => x.deviceGroup.name);
    for (const item of result) {
      this.sorterSvc.sortBy(item.devicesWithStatuses, x => x.device.name);
    }
    return result;
  }

  createDevicesWithStatuses(devices: Device[], deviceStatuses: DeviceStatus[]): DeviceWithStatus[] {
    const result: DeviceWithStatus[] = [];
    for (const device of devices) {
      const deviceWithStatus: DeviceWithStatus = {
        device: device,
        deviceStatus: deviceStatuses.find(x => x.deviceId === device.id)!,
      };
      result.push(deviceWithStatus);
    }
    return result;
  }

  createGlobalBulkActionItems(): ItemWithIcon<GlobalBulkActionId>[] {
    const result: ItemWithIcon<GlobalBulkActionId>[] = [
      { id: GlobalBulkActionId.shutdownStopped, name: translate('Shutdown stopped'), iconName: IconName.power_settings_new },
      // { id: GlobalBulkActionId.restartStopped, name: translate('Restart stopped'), iconName: IconName.restart_alt },
    ];
    return result;
  }

  createBulkActionItems(): IdWithName[] {
    const result: IdWithName[] = [
      { id: BulkActionId.setNote, name: translate('Set note') },
      { id: BulkActionId.restart, name: translate('Restart') },
      { id: BulkActionId.shutdown, name: translate('Shutdown') }
    ];
    return result;
  }
}

interface ItemWithIcon<TId> {
  id: TId;
  iconName?: IconName | null;
  name: string;
}

interface GlobalActionOptionsVisibility {
  shutdown?: boolean | null;
  restart?: boolean | null;
}

interface ActionOptionsVisibility {
  setNote?: boolean | null;
  restart?: boolean | null;
  shutdown?: boolean | null;
  start?: boolean | null;
}

interface DeviceWithStatus {
  device: Device;
  deviceStatus: DeviceStatus;
}

interface GroupWithDevices {
  deviceGroup: DeviceGroup;
  devicesWithStatuses: DeviceWithStatus[];
}

interface Signals {
  groupsWithDevices: Signal<GroupWithDevices[]>;
}
