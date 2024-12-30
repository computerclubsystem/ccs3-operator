import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { AsyncPipe, DatePipe, JsonPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { TranslocoPipe } from '@jsverse/transloco';
import { Observable } from 'rxjs';

import { InternalSubjectsService } from '@ccs3-operator/shared';
import { NotificationItem } from './declarations';

@Component({
  selector: 'ccs3-op-notification-list-component',
  templateUrl: 'notification-list.component.html',
  standalone: true,
  imports: [MatListModule, MatIconModule, MatExpansionModule, DatePipe, AsyncPipe, JsonPipe, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationListComponent implements OnInit {
  signals = this.createSignals();
  items$!: Observable<NotificationItem[]>;

  private readonly internalSubjectsSvc = inject(InternalSubjectsService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    // this.items$ = this.internalSubjectsSvc.getNotificationsChanged().pipe(
    //   takeUntilDestroyed(this.destroyRef)
    // ).subscribe((notifications: NotificationItem[]) => {
    //   this.signals.notifications.set(notifications);
    // });
    this.items$ = this.internalSubjectsSvc.getNotificationsChanged();
  }

  createSignals(): Signals {
    const signals: Signals = {
      notifications: signal(null),
    };
    return signals;
  }
}

interface Signals {
  notifications: WritableSignal<NotificationItem[] | null>;
}

