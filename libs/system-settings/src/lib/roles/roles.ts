import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoDirective } from '@jsverse/transloco';

import { MessageTransportService, RouteNavigationService, SorterService, IconName } from '@ccs3-operator/shared';
import { createGetAllRolesRequestMessage, GetAllRolesReplyMessage, Role } from '@ccs3-operator/messages';
import { BooleanIndicatorComponent } from '@ccs3-operator/boolean-indicator';

@Component({
  selector: 'ccs3-op-system-settings-roles',
  templateUrl: 'roles.html',
  imports: [MatButtonModule, MatIconModule, TranslocoDirective, BooleanIndicatorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesComponent implements OnInit {
  signals = this.createSignals();
  iconName = IconName;

  private readonly messageTransportSvc = inject(MessageTransportService);
  private readonly routeNavigationSvc = inject(RouteNavigationService);
  private readonly sorterSvc = inject(SorterService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.init();
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
    this.signals.isLoading.set(false);
    if (getAllRolesReplyMsg.header.failure) {
      return;
    }

    this.sorterSvc.sortBy(getAllRolesReplyMsg.body.roles, x => x.name);
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
