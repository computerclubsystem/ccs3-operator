import { ChangeDetectionStrategy, Component, computed, input, Signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { TranslocoDirective } from '@jsverse/transloco';

import { Device, DeviceStatus, Tariff, TariffType } from '@ccs3-operator/messages';
import { SecondsToTimePipe } from '@ccs3-operator/shared';

@Component({
  selector: 'ccs3-op-remaining-time-rank',
  templateUrl: 'remaining-time-rank.component.html',
  imports: [MatCardModule, TranslocoDirective, SecondsToTimePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RemainingTimeRankComponent {
  allDevicesMap = input<Map<number, Device>>();
  allTariffsMap = input<Map<number, Tariff>>();
  deviceStatuses = input<DeviceStatus[]>();

  readonly signals = this.createSignals();

  createSignals(): Signals {
    const signals: Signals = {
      rankItems: computed(() => {
        const allDevicesMap = this.allDevicesMap();
        const allTariffs = this.allTariffsMap();
        const deviceStatuses = this.deviceStatuses();
        const rankItems = this.createRankItems(allDevicesMap, allTariffs, deviceStatuses);
        return rankItems;
      }),
    };
    return signals;
  }

  createRankItems(
    devicesMap: Map<number, Device> | undefined,
    tariffsMap: Map<number, Tariff> | undefined,
    deviceStatuses: DeviceStatus[] | undefined,
  ): RemainingTimeRankItem[] {
    let rankItems: RemainingTimeRankItem[] = [];
    if (devicesMap && tariffsMap && deviceStatuses) {
      const startedDeviceStatuses = deviceStatuses.filter(x => x.started);
      for (const deviceStatus of startedDeviceStatuses) {
        const device = devicesMap.get(deviceStatus.deviceId);
        const tariff = tariffsMap.get(deviceStatus.tariff!);
        if (device && tariff) {
          rankItems.push({
            deviceId: deviceStatus.deviceId,
            deviceName: device.name!,
            remainingSeconds: this.getRemainingSeconds(deviceStatus.remainingSeconds!, tariffsMap, deviceStatus.continuationTariffId),
            continuationTarifId: deviceStatus.continuationTariffId,
            tariff: tariff,
          });
        }
      }
      rankItems.sort((left, right) => left.remainingSeconds - right.remainingSeconds);
      rankItems = rankItems.slice(0, 10);
    }
    return rankItems;
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
  rankItems: Signal<RemainingTimeRankItem[]>;
}

interface RemainingTimeRankItem {
  deviceId: number;
  deviceName: string;
  remainingSeconds: number;
  continuationTarifId?: number | null;
  tariff: Tariff;
}
