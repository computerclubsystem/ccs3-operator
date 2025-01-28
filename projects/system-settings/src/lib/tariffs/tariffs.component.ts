import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoDirective } from '@jsverse/transloco';

import {
  createGetAllTariffsRequestMessage, GetAllTariffsReplyMessage, GetAllTariffsRequestMessageBody, Tariff,
  TariffType
} from '@ccs3-operator/messages';
import {
  InternalSubjectsService, MessageTransportService, FullDatePipe, MinutesToTimePipe, TariffTypeToNamePipe,
  RouteNavigationService
} from '@ccs3-operator/shared';
import { IconName } from '@ccs3-operator/shared/types';
import { BooleanIndicatorComponent } from '@ccs3-operator/boolean-indicator';

@Component({
  selector: 'ccs3-op-system-settings-tariffs',
  templateUrl: 'tariffs.component.html',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, TranslocoDirective, BooleanIndicatorComponent, FullDatePipe, MinutesToTimePipe,
    TariffTypeToNamePipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TariffsComponent implements OnInit {
  readonly signals = this.createSignals();
  readonly iconName = IconName;
  readonly tariffType = TariffType;

  private readonly internalSubjectsSvc = inject(InternalSubjectsService);
  private readonly messageTransportSvc = inject(MessageTransportService);
  private readonly routeNavigationSvc = inject(RouteNavigationService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.internalSubjectsSvc.whenSignedIn().pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.loadAllTariffs());
  }

  loadAllTariffs(): void {
    const msg = createGetAllTariffsRequestMessage();
    msg.body.types = [TariffType.duration, TariffType.fromTo];
    this.messageTransportSvc.sendAndAwaitForReply<GetAllTariffsRequestMessageBody>(msg)
      .subscribe(getAllTariffsReplyMsg => this.processGetAllTariffsReplyMessage(getAllTariffsReplyMsg));
  }

  processGetAllTariffsReplyMessage(getAllTariffsReplyMsg: GetAllTariffsReplyMessage): void {
    const displayTariffItem: TariffDisplayItem[] = [];
    for (const tariff of getAllTariffsReplyMsg.body.tariffs) {
      displayTariffItem.push({
        tariff: tariff,
        tariffTypeName: tariff.type.toString(),
      });
    }
    this.signals.tariffDisplayItems.set(displayTariffItem);
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
}
