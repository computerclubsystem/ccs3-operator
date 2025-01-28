import {
  ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, WritableSignal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoDirective } from '@jsverse/transloco';

import {
  createGetAllTariffsRequestMessage, GetAllTariffsReplyMessage, GetAllTariffsRequestMessageBody, Tariff,
  TariffType
} from '@ccs3-operator/messages';
import {
  FullDatePipe, InternalSubjectsService, MessageTransportService, MinutesToTimePipe, RouteNavigationService, SecondsToTimePipe,
} from '@ccs3-operator/shared';
import { IconName } from '@ccs3-operator/shared/types';
import { BooleanIndicatorComponent } from '@ccs3-operator/boolean-indicator';

@Component({
  selector: 'ccs3-op-system-settings-prepaid-tariffs',
  templateUrl: 'prepaid-tariffs.component.html',
  imports: [MatButtonModule, MatIconModule, TranslocoDirective, BooleanIndicatorComponent, FullDatePipe, MinutesToTimePipe, SecondsToTimePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrepaidTariffsComponent implements OnInit {
  signals = this.createSignals();
  iconName = IconName;

  private internalSubjectsSvc = inject(InternalSubjectsService);
  private messageTransportSvc = inject(MessageTransportService);
  private routeNavigationSvc = inject(RouteNavigationService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.internalSubjectsSvc.whenSignedIn().pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.loadPrepaidTariffs());
  }

  onEditTariff(tariff: Tariff): void {
    this.routeNavigationSvc.navigateToEditPrepaidTariffRequested(tariff.id);
  }

  onCreateNew(): void {
    this.routeNavigationSvc.navigateToCreateNewPrepaidTariffRequested();
  }

  loadPrepaidTariffs(): void {
    const msg = createGetAllTariffsRequestMessage();
    msg.body.types = [TariffType.prepaid];
    this.messageTransportSvc.sendAndAwaitForReply<GetAllTariffsRequestMessageBody>(msg)
      .subscribe(getAllTariffsReplyMsg => this.processGetAllTariffsReplyMessage(getAllTariffsReplyMsg));
  }

  processGetAllTariffsReplyMessage(getAllTariffsReplyMsg: GetAllTariffsReplyMessage): void {
    const displayTariffItem: TariffDisplayItem[] = [];
    for (const tariff of getAllTariffsReplyMsg.body.tariffs) {
      displayTariffItem.push({
        tariff: tariff,
      });
    }
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
}
