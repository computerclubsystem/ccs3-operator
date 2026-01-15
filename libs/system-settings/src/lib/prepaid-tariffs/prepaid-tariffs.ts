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
  GetAllTariffsRequestMessageBody, GetAllUsersReplyMessage, GetAllUsersRequestMessageBody,
  Message, ReplyMessage, Tariff, TariffType, User,
} from '@ccs3-operator/messages';
import {
  FullDatePipe, MessageTransportService, MinutesToTimePipe, MoneyFormatPipe,
  PermissionName, PermissionsService, RouteNavigationService, SecondsToTimePipe, SorterService, IconName
} from '@ccs3-operator/shared';
import { BooleanIndicatorComponent } from '@ccs3-operator/boolean-indicator';

@Component({
  selector: 'ccs3-op-system-settings-prepaid-tariffs',
  templateUrl: 'prepaid-tariffs.html',
  imports: [
    MatButtonModule, MatIconModule, TranslocoDirective, BooleanIndicatorComponent, FullDatePipe,
    MinutesToTimePipe, SecondsToTimePipe, MoneyFormatPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrepaidTariffsComponent implements OnInit {
  signals = this.createSignals();
  iconName = IconName;

  private readonly messageTransportSvc = inject(MessageTransportService);
  private readonly routeNavigationSvc = inject(RouteNavigationService);
  private readonly permissionsSvc = inject(PermissionsService);
  private readonly sorterSvc = inject(SorterService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.loadData();
  }

  onEditTariff(tariff: Tariff): void {
    this.routeNavigationSvc.navigateToEditPrepaidTariffRequested(tariff.id);
  }

  onCreateNew(): void {
    this.routeNavigationSvc.navigateToCreateNewPrepaidTariffRequested();
  }

  loadData(): void {
    const getAllTariffsReqMsg = createGetAllTariffsRequestMessage();
    getAllTariffsReqMsg.body.types = [TariffType.prepaid];
    let getAllUsersObservable: Observable<Message<unknown>>;
    const hasUsersReadPermissions = this.permissionsSvc.hasPermission(PermissionName.usersRead);
    if (hasUsersReadPermissions) {
      const getAllUsersReqMsg = createGetAllUsersRequestMessage();
      getAllUsersObservable = this.messageTransportSvc.sendAndAwaitForReply<GetAllUsersRequestMessageBody>(getAllUsersReqMsg);
    } else {
      const replyMsg = { body: { users: [] as User[] }, header: {} } as GetAllUsersReplyMessage;
      getAllUsersObservable = of(replyMsg);
    }
    const forkJoinObservables: LoadDataForkJoinObservables = {
      users: getAllUsersObservable,
      tariffs: this.messageTransportSvc.sendAndAwaitForReply<GetAllTariffsRequestMessageBody>(getAllTariffsReqMsg),
    };
    forkJoin(forkJoinObservables).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(loadDataReplyMessages => this.processLoadDataReplyMessagesloadDataReplyMessagess(loadDataReplyMessages as LoadDataMessages));
  }

  processLoadDataReplyMessagesloadDataReplyMessagess(loadDataReplyMessages: LoadDataMessages): void {
    if (loadDataReplyMessages.tariffs.header.failure
      || loadDataReplyMessages.users.header.failure) {
      return;
    }
    const allUsersMap = new Map<number, User>(loadDataReplyMessages.users.body.users.map(x => ([x.id, x])));
    const displayTariffItem: TariffDisplayItem[] = [];
    for (const tariff of loadDataReplyMessages.tariffs.body.tariffs) {
      displayTariffItem.push({
        tariff: tariff,
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

  processGetAllTariffsReplyMessage(getAllTariffsReplyMsg: GetAllTariffsReplyMessage): void {
    if (getAllTariffsReplyMsg.header.failure) {
      return;
    }

    const displayTariffItem: TariffDisplayItem[] = [];
    for (const tariff of getAllTariffsReplyMsg.body.tariffs) {
      displayTariffItem.push({
        tariff: tariff,
      });
    }
    this.sorterSvc.sortBy(displayTariffItem, x => x.tariff.name);
    this.signals.tariffDisplayItems.set(displayTariffItem);
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
  tariffDurationText?: string;
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

