import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { NotificationComponentData } from './declarations';
import { IconName } from '@ccs3-operator/shared/types';
import { NotificationItem } from '@ccs3-operator/shared';

@Component({
  selector: 'ccs3-op-notification-component',
  templateUrl: 'notification.component.html',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationComponent {
  @Input()
  notification?: NotificationItem;

  readonly data: NotificationComponentData = inject(MAT_SNACK_BAR_DATA, { optional: true });
  readonly snackBarRef = inject(MatSnackBarRef);
  readonly iconName = IconName;

  onClose(): void {
    this.snackBarRef.dismiss();
  }
}
