import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SorterService {
  /**
   *
   * @param items Sorts array in-place
   * @param valueSelector The value of the array item to use for sorting
   * @param sortOrder Sort order
   */
  sortBy<TItem, TValue>(
    items: TItem[],
    valueSelector: (item: TItem) => TValue,
    sortOrder: SortOrder = SortOrder.ascending
  ): void {
    const sortSign = sortOrder === SortOrder.ascending ? 1 : -1;
    items.sort((left, right) => {
      const leftValue = valueSelector(left);
      const rightValue = valueSelector(right);
      if (leftValue > rightValue) {
        return 1 * sortSign;
      } else if (leftValue < rightValue) {
        return -1 * sortSign;
      } else {
        return 0;
      }
    });
  }
}

export const enum SortOrder {
  ascending = 1,
  descending = 2,
}
