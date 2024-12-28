import { ChangeDetectionStrategy, Component, Inject, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

import { NotificationComponentData } from './declarations';

@Component({
  selector: 'ccs3-op-notification-component',
  imports: [MatIconModule],
  templateUrl: 'notification.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationComponent {
  // data = inject(MAT_SNACK_BAR_DATA);
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: NotificationComponentData) { }
}
