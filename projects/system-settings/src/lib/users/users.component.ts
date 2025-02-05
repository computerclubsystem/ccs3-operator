import {
  ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, WritableSignal
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslocoDirective } from '@jsverse/transloco';

import { createGetAllUsersRequestMessage, GetAllUsersReplyMessage, User } from '@ccs3-operator/messages';
import { IconName } from '@ccs3-operator/shared/types';
import { FullDatePipe, InternalSubjectsService, MessageTransportService } from '@ccs3-operator/shared';
import { BooleanIndicatorComponent } from '@ccs3-operator/boolean-indicator';

@Component({
  selector: 'ccs3-op-system-settings-users',
  templateUrl: 'users.component.html',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, TranslocoDirective, BooleanIndicatorComponent, FullDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent implements OnInit {
  signals = this.createSignals();
  iconName = IconName;

  private readonly internalSubjectsSvc = inject(InternalSubjectsService);
  private readonly messageTransportSvc = inject(MessageTransportService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.internalSubjectsSvc.whenSignedIn().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.init());
  }

  init(): void {
    this.loadAllUsers();
  }

  loadAllUsers(): void {
    this.signals.isLoading.set(true);
    const requestMsg = createGetAllUsersRequestMessage();
    this.messageTransportSvc.sendAndAwaitForReply(requestMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(getAllUsersReplyMsg => this.processGetAllUsersReplyMessage(getAllUsersReplyMsg as GetAllUsersReplyMessage));
  }

  processGetAllUsersReplyMessage(getAllUsersReplyMsg: GetAllUsersReplyMessage): void {
    if (getAllUsersReplyMsg.header.failure) {
      return;
    }
    this.signals.users.set(getAllUsersReplyMsg.body.users);
    this.signals.isLoading.set(false);
  }

  onEditUser(user: User): void {
    this.router.navigate([user.id, 'edit'], { relativeTo: this.activatedRoute });

  }

  onCreateNew(): void {
    this.router.navigate(['create'], { relativeTo: this.activatedRoute });
  }

  createSignals(): Signals {
    const signals: Signals = {
      isLoading: signal(false),
      users: signal([]),
    };
    return signals;
  }
}

interface Signals {
  isLoading: WritableSignal<boolean>;
  users: WritableSignal<User[]>;
}
