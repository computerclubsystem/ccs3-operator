import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoDirective } from '@jsverse/transloco';

import {
  createGetAllTariffsRequestMessage, GetAllTariffsReplyMessage, GetAllTariffsRequestMessageBody, Tariff
} from '@ccs3-operator/messages';
import { InternalSubjectsService, MessageTransportService, FullDatePipe } from '@ccs3-operator/shared';
import { IconName } from '@ccs3-operator/shared/types';

@Component({
  selector: 'ccs3-op-tariffs',
  templateUrl: 'tariffs.component.html',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, TranslocoDirective, FullDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TariffsComponent implements OnInit {
  readonly signals = this.createSignals();
  readonly iconName = IconName;

  private readonly internalSubjectsSvc = inject(InternalSubjectsService);
  private readonly messageTransportSvc = inject(MessageTransportService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.internalSubjectsSvc.whenSignedIn().pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.requestAllTariffs());
  }

  requestAllTariffs(): void {
    const msg = createGetAllTariffsRequestMessage();
    this.messageTransportSvc.sendAndAwaitForReplyByType<GetAllTariffsRequestMessageBody>(msg)
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
    this.internalSubjectsSvc.navigateToCreateNewTariffRequested();
  }

  onEditTariff(tariff: Tariff): void {
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
  // TODO: Create pipes for these ?
  tariffTypeName: string;
  tariffDurationText?: string;
  tariffFromTimeText?: string;
  tariffToTimeText?: string;
  tariff: Tariff;
}
