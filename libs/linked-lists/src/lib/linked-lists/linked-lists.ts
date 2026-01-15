import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { IconName } from '@ccs3-operator/shared';
import { LinkedListItem, LinkedListItemsChangedEventArgs } from './declarations';

@Component({
  selector: 'ccs3-op-linked-lists',
  templateUrl: 'linked-lists.html',
  imports: [MatDividerModule, MatIconModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkedListsComponent {
  availableItemsTitle = input<string>();
  availableItems = input<LinkedListItem[]>();
  selectedItemsTitle = input<string>();
  selectedItems = input<LinkedListItem[]>();
  itemsChanged = output<LinkedListItemsChangedEventArgs>();
  iconName = IconName;

  onAddToSelectedItems(item: LinkedListItem): void {
    const currentAvailableItems = this.availableItems()!;
    const selectedItemIndex = currentAvailableItems.findIndex(x => x.id === item.id);
    currentAvailableItems.splice(selectedItemIndex, 1);
    const currentSelectedItems = this.selectedItems()!;
    currentSelectedItems.push(item);
    this.itemsChanged.emit({ available: currentAvailableItems, selected: currentSelectedItems });
  }

  onRemoveFromSelectedItems(item: LinkedListItem): void {
    const currentSelectedItems = this.selectedItems()!;
    const selectedItemIndex = currentSelectedItems.findIndex(x => x.id === item.id);
    currentSelectedItems.splice(selectedItemIndex, 1);
    const currentAvailableItems = this.availableItems()!;
    currentAvailableItems.push(item);
    this.itemsChanged.emit({ available: currentAvailableItems, selected: currentSelectedItems });
  }
}
