export interface LinkedListItem {
  id: number;
  name: string;
  description?: string | null;
}

export interface LinkedListItemsChangedEventArgs {
  available: LinkedListItem[];
  selected: LinkedListItem[];
}
