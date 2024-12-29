import { ChangeDetectionStrategy, Component, Inject, inject, Input, Optional } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

import { NotificationComponentData, NotificationItem } from './declarations';

@Component({
  selector: 'ccs3-op-notification-component',
  templateUrl: 'notification.component.html',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationComponent {
  // data = inject(MAT_SNACK_BAR_DATA);
  @Input()
  notification?: NotificationItem;
  data: NotificationComponentData = inject(MAT_SNACK_BAR_DATA, { optional: true });
}
