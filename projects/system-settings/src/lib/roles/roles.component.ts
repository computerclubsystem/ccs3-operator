import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoDirective } from '@jsverse/transloco';

import { InternalSubjectsService, MessageTransportService, RouteNavigationService } from '@ccs3-operator/shared';
import { createGetAllRolesRequestMessage, GetAllRolesReplyMessage, Role } from '@ccs3-operator/messages';
import { NotificationsService } from '@ccs3-operator/notifications';
import { IconName } from '@ccs3-operator/shared/types';
import { BooleanIndicatorComponent } from '@ccs3-operator/boolean-indicator';

@Component({
  selector: 'ccs3-op-system-settings-roles',
  templateUrl: 'roles.component.html',
  imports: [MatButtonModule, MatIconModule, TranslocoDirective, BooleanIndicatorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesComponent implements OnInit {
  signals = this.createSignals();
  iconName = IconName;

  private readonly internalSubjectsSvc = inject(InternalSubjectsService);
  private readonly messageTransportSvc = inject(MessageTransportService);
  private readonly routeNavigationSvc = inject(RouteNavigationService);
  private readonly notificationsSvc = inject(NotificationsService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.internalSubjectsSvc.whenSignedIn().pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.init());
  }

  init(): void {
    this.loadAllRoles();
  }

  onEditRole(role: Role): void {
    this.routeNavigationSvc.navigateToEditRoleRequested(role.id);
  }

  onCreateNew(): void {
    this.routeNavigationSvc.navigateToCreateNewRoleRequested();
  }

  loadAllRoles(): void {
    this.signals.isLoading.set(true);
    const requestMsg = createGetAllRolesRequestMessage();
    this.messageTransportSvc.sendAndAwaitForReply(requestMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(getAllRolesReplyMsg => this.processGetAllRolesReplyMessage(getAllRolesReplyMsg as GetAllRolesReplyMessage));
  }

  processGetAllRolesReplyMessage(getAllRolesReplyMsg: GetAllRolesReplyMessage): void {
    if (getAllRolesReplyMsg.header.failure) {
      return;
    }
    this.signals.isLoading.set(false);
    this.signals.roles.set(getAllRolesReplyMsg.body.roles);
  }

  createSignals(): Signals {
    const signals: Signals = {
      isLoading: signal(false),
      roles: signal([]),
    };
    return signals;
  }
}

interface Signals {
  isLoading: WritableSignal<boolean>;
  roles: WritableSignal<Role[]>;
}
