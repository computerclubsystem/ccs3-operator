import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal,
  WritableSignal
} from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { translate, TranslocoDirective } from '@jsverse/transloco';

import { Group, groupArrayBy, InternalSubjectsService, MessageTransportService, NotificationType, NoYearDatePipe } from '@ccs3-operator/shared';
import {
  createForceSignOutAllUserSessionsRequestMessage,
  createGetSignedInUsersRequestMessage, ForceSignOutAllUserSessionsReplyMessage, GetSignedInUsersReplyMessage, SignedInUser
} from '@ccs3-operator/messages';
import { NotificationsService } from '@ccs3-operator/notifications';
import { IconName } from '@ccs3-operator/shared/types';

@Component({
  selector: 'ccs3-op-signed-in-users',
  templateUrl: 'signed-in-users.component.html',
  imports: [MatExpansionModule, MatDividerModule, MatButtonModule, TranslocoDirective, NoYearDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignedInUsersComponent implements OnInit {
  readonly signals = this.createSignals();

  private readonly inernalsSubjectSvc = inject(InternalSubjectsService);
  private readonly messageTransportSvc = inject(MessageTransportService);
  private readonly notificationsSvc = inject(NotificationsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.inernalsSubjectSvc.whenSignedIn().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.init());
  }

  init(): void {
    this.loadSignedInUsers();
  }

  onSignOutAllSessions(group: SignedInUserGroup): void {
    const reqMsg = createForceSignOutAllUserSessionsRequestMessage();
    reqMsg.body.userId = group.key;
    const username = group.items[0].username;
    this.messageTransportSvc.sendAndAwaitForReply(reqMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(replyMsg => this.processForceSignOutAllUserSessionsReplyMessage(replyMsg as ForceSignOutAllUserSessionsReplyMessage, username));
  }

  processForceSignOutAllUserSessionsReplyMessage(replyMsg: ForceSignOutAllUserSessionsReplyMessage, username: string): void {
    if (replyMsg.header.failure) {
      return;
    }
    const title = translate('User {{username}} signed out', { username });
    const description = translate(
      `{{sessionsCount}} sessions and {{connectionsCount}} connections were removed`,
      {
        sessionsCount: replyMsg.body.sessionsCount,
        connectionsCount: replyMsg.body.connectionsCount,
      });
    this.notificationsSvc.show(NotificationType.success, title, description, IconName.check, replyMsg);
    this.loadSignedInUsers();
  }

  loadSignedInUsers(): void {
    this.signals.loadingSignedInUsers.set(true);
    const reqMsg = createGetSignedInUsersRequestMessage();
    this.messageTransportSvc.sendAndAwaitForReply(reqMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(replyMsg => this.processGetSignedInUsersReplyMessage(replyMsg as GetSignedInUsersReplyMessage));
  }

  processGetSignedInUsersReplyMessage(replyMsg: GetSignedInUsersReplyMessage): void {
    this.signals.loadingSignedInUsers.set(false);
    if (replyMsg.header.failure) {
      return;
    }
    this.setSignedInUsers(replyMsg.body.signedInUsers);
  }

  setSignedInUsers(signedInUsers: SignedInUser[]): void {
    this.signals.signedInUsers.set(signedInUsers);
    const groups = groupArrayBy(signedInUsers, x => x.userId);
    this.sortSignedInUsersGroupsByUsername(groups);
    this.sortSignedInUsersGroupItemsByConnectedDate(groups);
    this.signals.groupedSignedInUsers.set(groups);
    this.changeDetectorRef.markForCheck();
  }

  sortSignedInUsersGroupItemsByConnectedDate(groups: SignedInUserGroup[]): void {
    groups.forEach(grp => grp.items.sort((left, right) => right.connectedAt - left.connectedAt));
  }

  sortSignedInUsersGroupsByUsername(groups: SignedInUserGroup[]): void {
    groups.sort((left, right) => {
      const leftUsername = left.items[0].username;
      const rightUsername = right.items[0].username;
      return leftUsername.localeCompare(rightUsername);
    });
  }

  createSignals(): Signals {
    const signals: Signals = {
      signedInUsers: signal([]),
      groupedSignedInUsers: signal([]),
      loadingSignedInUsers: signal(false),
    };
    return signals;
  }
}

type SignedInUserGroup = Group<number, SignedInUser>;

interface Signals {
  signedInUsers: WritableSignal<SignedInUser[]>;
  groupedSignedInUsers: WritableSignal<SignedInUserGroup[]>;
  loadingSignedInUsers: WritableSignal<boolean>;
}
