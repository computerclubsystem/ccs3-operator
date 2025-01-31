import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

import { InternalSubjectsService, NotificationItem, NotificationType } from '@ccs3-operator/shared';
import { IconName } from '@ccs3-operator/shared/types';
import { NotificationComponentData } from './declarations';
import { NotificationComponent } from './notification.component';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly internalSubjectsSvc = inject(InternalSubjectsService);
  private readonly snackBar = inject(MatSnackBar);
  private notificationsBufferSize = 200;
  private notifications: NotificationItem[] = [];
  private duration = 8000;
  private idSequence = 0;

  show(type: NotificationType, title: string, description?: string | null, icon?: IconName | null, customData?: any): void {
    const item: NotificationItem = {
      id: this.getNextId(),
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
      verticalPosition: 'top',
      horizontalPosition: 'end',
    };
    this.snackBar.openFromComponent(NotificationComponent, config);
    this.internalSubjectsSvc.setNotificationsChanged(this.notifications);
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

  private getNextId(): string {
    this.idSequence++;
    return `${this.idSequence}`;
  }
}
