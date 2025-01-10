import { Injectable } from '@angular/core';

import { Tariff, TariffType } from '@ccs3-operator/messages';

@Injectable({ providedIn: 'root' })
export class TariffService {
  canUseTariff(tariff?: Tariff | null): CanUseTariffResult {
    const result: CanUseTariffResult = {
      canUse: false,
    };
    if (!tariff) {
      result.canUse = false;
      return result;
    }
    const currentDayMinute = this.getCurrentDayMinute();

    if (tariff.type === TariffType.duration) {
      const restrictStart = tariff.restrictStartTime;
      if (restrictStart) {
        const isCurrentDayMinuteInTariffRestrictStartInterval = this.isDayMinuteInInterval(currentDayMinute, tariff.restrictStartFromTime!, tariff.restrictStartToTime!);
        if (!isCurrentDayMinuteInTariffRestrictStartInterval) {
          result.canUse = false;
          result.availableInMinutes = this.getAvailableInMinutes(tariff.restrictStartFromTime!, currentDayMinute);
          return result;
        }
      }
    }

    if (tariff.type === TariffType.fromTo) {
      const isCurrentDayMinuteInTariffInterval = this.isDayMinuteInInterval(currentDayMinute, tariff.fromTime!, tariff.toTime!);
      if (!isCurrentDayMinuteInTariffInterval) {
        result.availableInMinutes = this.getAvailableInMinutes(tariff.fromTime!, currentDayMinute);
        result.canUse = false;
        return result;
      }
    }

    result.canUse = true;
    return result;
  }

  private getAvailableInMinutes(tariffFromTime: number, currentDayMinute: number): number {
    if (tariffFromTime > currentDayMinute) {
      return tariffFromTime - currentDayMinute;
    } else {
      // currentDayMinute passed tariff's fromTime
      // We must calculate the time to midnight and then add the time to tariffFromTime
      const minutesToMidnight = 1440 - currentDayMinute;
      return minutesToMidnight + tariffFromTime;
    }
  }

  isDayMinuteInInterval(dayMinute: number, from: number, to: number): boolean {
    if (from === to) {
      // If "from" is equal to "to", then return true only if dayMinute is equal to them too
      return dayMinute === from;
    }

    if (from < to) {
      // When "from" is less than "to", dayMinute must be between them
      return (dayMinute >= from && dayMinute <= to);
    }

    if (from > to) {
      // When "from" is greater than "to" - the period crosses midnight
      // The "dayMinute" must be >= "from" (from "from" up to minute before midnight)
      // or <= "to" (from midnight up to "to")
      return (dayMinute >= from || dayMinute <= to);
    }
    return false;
  }

  getCurrentDayMinute(): number {
    const currentDate = this.getCurrentDate();
    const currentDayMinute = currentDate.getHours() * 60 + currentDate.getMinutes();
    return currentDayMinute;
  }

  getCurrentDate(): Date {
    return new Date();
  }
}

export interface CanUseTariffResult {
  canUse: boolean;
  availableInMinutes?: number | null;
}
