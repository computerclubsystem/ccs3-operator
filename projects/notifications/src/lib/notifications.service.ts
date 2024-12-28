import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

import { IconName } from '@ccs3-operator/shared';
import { NotificationComponentData, NotificationItem, NotificationType } from './declarations';
import { NotificationComponent } from './notification.component';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private snackBar = inject(MatSnackBar);
  private notificationsBufferSize = 200;
  private notifications: NotificationItem[] = [];
  private duration = 10000;

  show(type: NotificationType, title: string, description?: string | null, icon?: IconName | null, customData?: any): void {
    const item: NotificationItem = {
      addedAt: this.getNow(),
      description: description,
      title: title,
      type: type,
      icon: icon,
      customData: customData,
    };
    const data: NotificationComponentData = {
      item: item,
    };
    const panelClass = this.getPanelClass(type);
    this.addNotificationItem(item);
    const config: MatSnackBarConfig<NotificationComponentData> = {
      data: data,
      panelClass: panelClass,
      duration: this.duration,
    };
    this.snackBar.openFromComponent(NotificationComponent, config);
  }

  private addNotificationItem(item: NotificationItem): void {
    if (this.notifications.length >= this.notificationsBufferSize) {
      this.notifications.shift();
    }
    this.notifications.push(item);
  }

  private getPanelClass(notificationType: NotificationType): string {
    return `ccs3-op-notification-type-${notificationType}`;
  }

  private getNow(): number {
    return Date.now();
  }
}
