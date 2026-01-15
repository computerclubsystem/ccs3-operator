import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GroupingService {
  groupBy<TItem, TKey>(items: TItem[], keySelector: (item: TItem) => TKey): ItemsGroup<TKey, TItem>[] {
    const map = new Map<TKey, TItem[]>();
    for (const item of items) {
      const key = keySelector(item);
      const mapItem = map.get(key);
      if (!mapItem) {
        map.set(key, [item]);
      } else {
        mapItem.push((item));
      }
    }
    const result: ItemsGroup<TKey, TItem>[] = [];
    for (const mapItem of map) {
      result.push({ key: mapItem[0], items: mapItem[1] });
    }
    return result;
  }
}

export interface ItemsGroup<TKey, TItem> {
  key: TKey;
  items: TItem[];
}
