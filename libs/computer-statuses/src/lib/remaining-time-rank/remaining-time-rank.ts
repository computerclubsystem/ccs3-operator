import { ChangeDetectionStrategy, Component, computed, inject, input, Signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { TranslocoDirective } from '@jsverse/transloco';

import { Device, DeviceGroup, DeviceStatus, Tariff, TariffType } from '@ccs3-operator/messages';
import { GroupingService, ItemsGroup, SecondsToTimePipe, SorterService } from '@ccs3-operator/shared';

@Component({
  selector: 'ccs3-op-remaining-time-rank',
  templateUrl: 'remaining-time-rank.html',
  imports: [MatCardModule, MatDividerModule, MatExpansionModule, TranslocoDirective, SecondsToTimePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RemainingTimeRankComponent {
  allDevicesMap = input<Map<number, Device>>();
  allTariffsMap = input<Map<number, Tariff>>();
  allDeviceGroupsMap = input<Map<number, DeviceGroup>>();
  deviceStatuses = input<DeviceStatus[]>();

  readonly signals = this.createSignals();

  private readonly groupingSvc = inject(GroupingService);
  private readonly sorterSvc = inject(SorterService);

  createSignals(): Signals {
    const signals: Signals = {
      rankItemGroups: computed(() => {
        const allDevicesMap = this.allDevicesMap();
        const allTariffs = this.allTariffsMap();
        const allDevicesGroupsMap = this.allDeviceGroupsMap();
        const deviceStatuses = this.deviceStatuses();
        const rankItems = this.createRankItems(allDevicesMap, allTariffs, allDevicesGroupsMap, deviceStatuses);
        return rankItems;
      }),
    };
    return signals;
  }

  createRankItems(
    devicesMap: Map<number, Device> | undefined,
    tariffsMap: Map<number, Tariff> | undefined,
    allDeviceGroupsMap: Map<number, DeviceGroup> | undefined,
    deviceStatuses: DeviceStatus[] | undefined,
  ): ItemsGroup<string, RemainingTimeRankItem>[] {
    const rankItems: RemainingTimeRankItem[] = [];
    if (devicesMap && tariffsMap && deviceStatuses) {
      const startedDeviceStatuses = deviceStatuses.filter(x => x.started);
      for (const deviceStatus of startedDeviceStatuses) {
        const device = devicesMap.get(deviceStatus.deviceId);
        const tariff = tariffsMap.get(deviceStatus.tariff!);
        if (device && tariff) {
          rankItems.push({
            deviceId: deviceStatus.deviceId,
            deviceName: device.name!,
            deviceGroupName: allDeviceGroupsMap?.get(device.deviceGroupId!)?.name || '',
            remainingSeconds: this.getRemainingSeconds(deviceStatus.remainingSeconds!, tariffsMap, deviceStatus.continuationTariffId),
            continuationTarifId: deviceStatus.continuationTariffId,
            tariff: tariff,
          });
        }
      }
      this.sorterSvc.sortBy(rankItems, x => x.remainingSeconds);
      // rankItems.sort((left, right) => left.remainingSeconds - right.remainingSeconds);
    }
    const grouped = this.groupingSvc.groupBy(rankItems, x => x.deviceGroupName);
    this.sorterSvc.sortBy(grouped, x => x.key);
    return grouped;
  }

  getRemainingSeconds(currentRemainingSeconds: number, tariffsMap: Map<number, Tariff>, continuationTariffId?: number | null): number {
    if (!continuationTariffId) {
      return currentRemainingSeconds;
    }
    const tariff = tariffsMap.get(continuationTariffId);
    if (!tariff || tariff.type !== TariffType.duration) {
      return currentRemainingSeconds;
    }
    // tariff.duration is in minutes - we must convert it to seconds
    return currentRemainingSeconds + 60 * tariff.duration!;
  }
}

interface Signals {
  rankItemGroups: Signal<ItemsGroup<string, RemainingTimeRankItem>[]>;
}

interface RemainingTimeRankItem {
  deviceId: number;
  deviceName: string;
  deviceGroupName: string;
  remainingSeconds: number;
  continuationTarifId?: number | null;
  tariff: Tariff;
}
