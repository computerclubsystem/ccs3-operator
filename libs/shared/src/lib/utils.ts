export interface Group<TKey, TItem> {
  key: TKey;
  items: TItem[];
}

export function groupArrayBy<TKey, TItem>(items: TItem[], keySelector: (item: TItem) => TKey): Group<TKey, TItem>[] {
  const groups: Group<TKey, TItem>[] = [];
  const map = new Map<TKey, TItem[]>();
  for (const item of items) {
    const key = keySelector(item);
    const mapItems = map.get(key);
    if (mapItems) {
      mapItems.push(item);
    } else {
      map.set(key, [item]);
    }
  }
  for (const mapKey of map.keys()) {
    groups.push({ key: mapKey, items: map.get(mapKey)! });
  }
  return groups;
}

