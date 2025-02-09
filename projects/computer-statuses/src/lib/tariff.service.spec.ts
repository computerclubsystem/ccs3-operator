import { Tariff, TariffType } from '@ccs3-operator/messages';
import { CanUseTariffResult, TariffService } from './tariff.service';

describe('TariffService', () => {
  let service: TariffService;
  beforeEach(() => {
    service = new TariffService();
  });

  describe('canUseTariff', () => {
    interface CanUseTariffTestItem {
      result: CanUseTariffResult;
      tariff: Tariff;
      currentDayMinute: number;
    }
    const nonFromToTariffTypes = Object.values(TariffType).filter(x => x !== TariffType.fromTo);
    const nonFromToTariffTypesTestItems = nonFromToTariffTypes.map(() => ({ result: { canUse: true }, currentDayMinute: 0, tariff: { type: TariffType.duration } as Tariff } as CanUseTariffTestItem));
    const canUseTariffTestItems: CanUseTariffTestItem[] = [
      // Non TariffType.fromTo should always be available
      ...nonFromToTariffTypesTestItems,
      // From = currentDayMinute -> To
      { result: { canUse: true }, currentDayMinute: 100, tariff: { type: TariffType.fromTo, fromTime: 100, toTime: 200 } as Tariff },
      { result: { canUse: true }, currentDayMinute: 1400, tariff: { type: TariffType.fromTo, fromTime: 1400, toTime: 1410 } as Tariff },
      // From = currentDayMinute -> Midnight -> To
      { result: { canUse: true }, currentDayMinute: 1400, tariff: { type: TariffType.fromTo, fromTime: 1400, toTime: 100 } as Tariff },
      // From -> currentDayMinute -> To
      { result: { canUse: true }, currentDayMinute: 101, tariff: { type: TariffType.fromTo, fromTime: 100, toTime: 200 } as Tariff },
      { result: { canUse: true }, currentDayMinute: 199, tariff: { type: TariffType.fromTo, fromTime: 100, toTime: 200 } as Tariff },
      // From -> currentDayMinute = To
      { result: { canUse: true }, currentDayMinute: 200, tariff: { type: TariffType.fromTo, fromTime: 100, toTime: 200 } as Tariff },
      // From -> currentDayMinute -> Midnight -> To
      { result: { canUse: true }, currentDayMinute: 1001, tariff: { type: TariffType.fromTo, fromTime: 1000, toTime: 100 } as Tariff },
      // From -> currentDayMinute = Midnight -> To
      { result: { canUse: true }, currentDayMinute: 0, tariff: { type: TariffType.fromTo, fromTime: 1000, toTime: 100 } as Tariff },
      // { result: { canUse: false, availableInMinutes: 100 }, currentDayMinute: 1300, tariff: { type: TariffType.fromTo, fromTime: 1400, toTime: 10 } as Tariff },
      // Current day minute is after tariff From - return false and calculated minutes to From
      // From -> To -> currentDayMinute -> Midnight -> From
      { result: { canUse: false, availableInMinutes: 1440 - 300 + 100 }, currentDayMinute: 300, tariff: { type: TariffType.fromTo, fromTime: 100, toTime: 200 } as Tariff },
      { result: { canUse: false, availableInMinutes: 1440 - 201 + 100 }, currentDayMinute: 201, tariff: { type: TariffType.fromTo, fromTime: 100, toTime: 200 } as Tariff },
    ];
    canUseTariffTestItems.forEach(testItem => {
      const tariff = testItem.tariff;
      it(`should return result according to tariff type ${tariff.type}, from ${tariff.fromTime}, to ${tariff.toTime} and current day minute ${testItem.currentDayMinute}`, () => {
        spyOn(service, 'getCurrentDayMinute').and.returnValue(testItem.currentDayMinute);

        const result = service.canUseTariff(testItem.tariff);

        expect(result).toEqual(testItem.result);
      });
    });

    it('should return true for all day minutes if tariff is from 0 to 1439 spanning entire 24 hours of the day', () => {
      const tariff: Tariff = {
        type: TariffType.fromTo,
        fromTime: 0,
        toTime: 1439,
      } as Tariff;
      for (let i = 0; i < 1440; i++) {
        const getCurrentDayMinuteSpy = jasmine.createSpy().and.returnValue(i);
        service.getCurrentDayMinute = getCurrentDayMinuteSpy;
        const result = service.canUseTariff(tariff);
        expect(result.canUse).toBe(true);
      }
    });
  });
});
