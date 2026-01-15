import { SorterService, SortOrder } from './sorter.service';

// Can be started with:
// npm run test -- --project shared
describe('SorterService', () => {
  let service: SorterService;
  beforeEach(() => {
    service = new SorterService();
  });

  describe('sortByMany', () => {
    interface SortByManySortItem {
      totalAmount: number;
      totalSeconds: number;
    }
    it(`should return sort by first property and if equal sort by second property`, () => {
      const items: SortByManySortItem[] = [
        { totalAmount: 60, totalSeconds: 50 },
        { totalAmount: 60, totalSeconds: 30 },
        { totalAmount: 60, totalSeconds: 80 },
        { totalAmount: 50, totalSeconds: 10 },
        { totalAmount: 50, totalSeconds: 20 },
      ];

      service.sortByMany(items, [{
        sortOrder: SortOrder.ascending,
        valueSelector: item => item.totalAmount,
      }, {
        sortOrder: SortOrder.descending,
        valueSelector: item => item.totalSeconds,
      }]);

      // Must be sorted ascending by .totalAmount, if equal - descending by .totalSeconds
      const expectedItems = [
        { totalAmount: 50, totalSeconds: 20 },
        { totalAmount: 50, totalSeconds: 10 },
        { totalAmount: 60, totalSeconds: 80 },
        { totalAmount: 60, totalSeconds: 50 },
        { totalAmount: 60, totalSeconds: 30 },
      ];
      expect(items).toEqual(expectedItems);
    });
  });
});
