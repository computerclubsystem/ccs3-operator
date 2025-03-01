import {
  ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, WritableSignal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoDirective } from '@jsverse/transloco';
import { forkJoin, Observable } from 'rxjs';

import {
  createGetAllTariffsRequestMessage, createGetAllUsersRequestMessage, GetAllTariffsReplyMessage,
  GetAllTariffsRequestMessageBody, GetAllUsersReplyMessage, GetAllUsersRequestMessageBody,
  Message, ReplyMessage, Tariff, TariffType, User,
} from '@ccs3-operator/messages';
import {
  FullDatePipe, InternalSubjectsService, MessageTransportService, MinutesToTimePipe, MoneyFormatPipe,
  RouteNavigationService, SecondsToTimePipe, SorterService,
} from '@ccs3-operator/shared';
import { IconName } from '@ccs3-operator/shared/types';
import { BooleanIndicatorComponent } from '@ccs3-operator/boolean-indicator';

@Component({
  selector: 'ccs3-op-system-settings-prepaid-tariffs',
  templateUrl: 'prepaid-tariffs.component.html',
  imports: [
    MatButtonModule, MatIconModule, TranslocoDirective, BooleanIndicatorComponent, FullDatePipe,
    MinutesToTimePipe, SecondsToTimePipe, MoneyFormatPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrepaidTariffsComponent implements OnInit {
  signals = this.createSignals();
  iconName = IconName;

  private readonly internalSubjectsSvc = inject(InternalSubjectsService);
  private readonly messageTransportSvc = inject(MessageTransportService);
  private readonly routeNavigationSvc = inject(RouteNavigationService);
  private readonly sorterSvc = inject(SorterService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.internalSubjectsSvc.whenSignedIn().pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.loadData());
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
    const getAllUsersReqMsg = createGetAllUsersRequestMessage();
    const forkJoinObservables: LoadDataForkJoinObservables = {
      users: this.messageTransportSvc.sendAndAwaitForReply<GetAllUsersRequestMessageBody>(getAllUsersReqMsg),
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
        updatedByUsername: allUsersMap.get(tariff.updatedByUserId!)?.username,
        createdByUsername: allUsersMap.get(tariff.createdByUserId!)?.username,
      });
    }
    this.sorterSvc.sortBy(displayTariffItem, x => x.tariff.name);
    this.signals.tariffDisplayItems.set(displayTariffItem);
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

