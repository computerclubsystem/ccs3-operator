import {
  ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, WritableSignal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoDirective } from '@jsverse/transloco';
import { forkJoin, Observable, of } from 'rxjs';

import {
  createGetAllTariffsRequestMessage, createGetAllUsersRequestMessage, GetAllTariffsReplyMessage,
  GetAllTariffsRequestMessageBody, GetAllUsersReplyMessage, GetAllUsersRequestMessageBody, Message,
  ReplyMessage, Tariff, TariffType, User
} from '@ccs3-operator/messages';
import {
  InternalSubjectsService, MessageTransportService, FullDatePipe, MinutesToTimePipe, TariffTypeToNamePipe,
  RouteNavigationService, MoneyFormatPipe, SorterService,
  PermissionsService,
  PermissionName
} from '@ccs3-operator/shared';
import { IconName } from '@ccs3-operator/shared/types';
import { BooleanIndicatorComponent } from '@ccs3-operator/boolean-indicator';

@Component({
  selector: 'ccs3-op-system-settings-tariffs',
  templateUrl: 'tariffs.component.html',
  imports: [
    MatButtonModule, MatIconModule, TranslocoDirective, BooleanIndicatorComponent, FullDatePipe, MinutesToTimePipe,
    TariffTypeToNamePipe, MoneyFormatPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TariffsComponent implements OnInit {
  readonly signals = this.createSignals();
  readonly iconName = IconName;
  readonly tariffType = TariffType;

  private readonly internalSubjectsSvc = inject(InternalSubjectsService);
  private readonly messageTransportSvc = inject(MessageTransportService);
  private readonly permissionsSvc = inject(PermissionsService);
  private readonly routeNavigationSvc = inject(RouteNavigationService);
  private readonly sorterSvc = inject(SorterService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.internalSubjectsSvc.whenSignedIn().pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.loadData());
  }

  loadData(): void {
    const getAllTariffsReqMsg = createGetAllTariffsRequestMessage();
    getAllTariffsReqMsg.body.types = [TariffType.duration, TariffType.fromTo];
    let getAllUsersObservable: Observable<Message<unknown>>;
    const hasUsersReadPermissions = this.permissionsSvc.hasPermission(PermissionName.usersRead);
    if (hasUsersReadPermissions) {
      const getAllUsersReqMsg = createGetAllUsersRequestMessage();
      getAllUsersObservable = this.messageTransportSvc.sendAndAwaitForReply<GetAllUsersRequestMessageBody>(getAllUsersReqMsg);
    } else {
      const replyMsg = { body: { users: [] as User[] }, header: {} } as GetAllUsersReplyMessage;
      getAllUsersObservable = of(replyMsg);
    }
    const forkJoinObservablesObject: LoadDataForkJoinObservables = {
      tariffs: this.messageTransportSvc.sendAndAwaitForReply<GetAllTariffsRequestMessageBody>(getAllTariffsReqMsg),
      users: getAllUsersObservable,
    };
    forkJoin(forkJoinObservablesObject).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(loadDataReplyMessages => this.processLoadDataReplyMessagesloadDataReplyMessagess(loadDataReplyMessages as LoadDataMessages));
    // this.messageTransportSvc.sendAndAwaitForReply<GetAllTcAllTariffsReplyMessage(getAllTariffsReplyMsg as GetAllTariffsReplyMessage));
  }

  processLoadDataReplyMessagesloadDataReplyMessagess(loadDataReplyMessages: LoadDataMessages): void {
    if (loadDataReplyMessages.tariffs.header.failure
      || loadDataReplyMessages.users.header.failure
    ) {
      return;
    }

    const allUsersMap = new Map<number, User>(loadDataReplyMessages.users.body.users.map(x => ([x.id, x])));
    const displayTariffItem: TariffDisplayItem[] = [];
    for (const tariff of loadDataReplyMessages.tariffs.body.tariffs) {
      displayTariffItem.push({
        tariff: tariff,
        tariffTypeName: tariff.type.toString(),
        updatedByUsername: this.getUsername(allUsersMap, tariff.updatedByUserId),
        createdByUsername: this.getUsername(allUsersMap, tariff.createdByUserId),
      });
    }
    this.sorterSvc.sortBy(displayTariffItem, x => x.tariff.name);
    this.signals.tariffDisplayItems.set(displayTariffItem);
  }

  getUsername(allUsersMap: Map<number, User>, userId?: number | null): string {
    if (!userId) {
      return '';
    }
    const username = allUsersMap.get(userId)?.username || '' + userId || '';
    return username;
  }

  onCreateNew(): void {
    this.routeNavigationSvc.navigateToCreateNewTariffRequested();
  }

  onEditTariff(tariff: Tariff): void {
    this.routeNavigationSvc.navigateToEditTariffRequested(tariff.id);
  }

  createSignals(): Signals {
    const signals: Signals = {
      tariffDisplayItems: signal(null),
    };
    return signals;
  }
}

interface Signals {
  tariffDisplayItems: WritableSignal<TariffDisplayItem[] | null>;
}

interface TariffDisplayItem {
  tariffTypeName: string;
  tariff: Tariff;
  createdByUsername?: string;
  updatedByUsername?: string;
}

interface LoadDataForkJoinObservables extends Record<string, Observable<Message<unknown>>> {
  users: Observable<Message<unknown>>;
  tariffs: Observable<Message<unknown>>;
}

interface LoadDataMessages extends Record<string, ReplyMessage<unknown>> {
  users: GetAllUsersReplyMessage;
  tariffs: GetAllTariffsReplyMessage;
}
