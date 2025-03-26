import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SorterService {
  /**
   * Sorts array in-place using many sort infos. If sort info determines the items values are equal, the sorting will continue with the next sort item
   * This allows sorting by one property, but if it is the same for the two compared items, to continue with the next property
   * achieving something like sortBy(x => x.age, SortOrder.ascending).thenBy(x => x.height, SortOrder.descending)
   * @param items Items to sort in-place
   * @param sortInfos Array of sort info to use until some of them returns non-zero value achieving sortBy(...).thenBy(...).thenBy(...)...
   */
  sortByMany<TItem>(
    items: TItem[],
    sortInfos: SortInfo<TItem>[],
  ): void {
    items.sort((left, right) => {
      for (const sortInfo of sortInfos) {
        const sortSign = sortInfo.sortOrder === SortOrder.ascending ? 1 : -1;
        const leftValue = sortInfo.valueSelector(left);
        const rightValue = sortInfo.valueSelector(right);
        // We need to use ! to satisfy type checks ts(18049): Object is possibly 'null' or 'undefined'
        const processedLeftValue = leftValue!;
        const processedRightValue = rightValue!;
        if (processedLeftValue > processedRightValue) {
          return 1 * sortSign;
        } else if (processedLeftValue < processedRightValue) {
          return -1 * sortSign;
        }
        // If this is reached - the values are equal or not comparable (like NaN compared with anything else or null with number)
        // Continue with the next sort info
      }
      return 0;
    });
  }

  /**
   * Sorts array in-place
   * @param items Items to sort in-place
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

export interface SortInfo<TItem> {
  valueSelector: (item: TItem) => SortableValueType,
  sortOrder: SortOrder,
}

export type SortableValueType = number | string | Date | null | undefined;
