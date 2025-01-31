import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Signal } from '@angular/core';
import { DatePipe, JsonPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { TranslocoPipe } from '@jsverse/transloco';
import { map, Observable } from 'rxjs';

import { InternalSubjectsService, NotificationItem } from '@ccs3-operator/shared';

@Component({
  selector: 'ccs3-op-notification-list-component',
  templateUrl: 'notification-list.component.html',
  standalone: true,
  imports: [MatListModule, MatIconModule, MatExpansionModule, DatePipe, JsonPipe, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationListComponent {
  private readonly internalSubjectsSvc = inject(InternalSubjectsService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  signals = this.createSignals();
  items$!: Observable<NotificationItem[]>;


  createSignals(): Signals {
    const signals: Signals = {
      notifications: toSignal(this.internalSubjectsSvc.getNotificationsChanged().pipe(
        map(notificationItems => {
          this.changeDetectorRef.markForCheck();
          return [...notificationItems].reverse();
        }),
      )),
    };
    return signals;
  }
}

interface Signals {
  notifications: Signal<NotificationItem[] | undefined>;
}

