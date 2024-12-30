import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { filter, first } from 'rxjs';

import {
  createGetAllDevicesRequestMessage, Device, GetAllDevicesReplyMessage, GetAllDevicesRequestMessageBody
} from '@ccs3-operator/messages';
import { InternalSubjectsService, MessageTransportService, NoYearDatePipe } from '@ccs3-operator/shared';

@Component({
  selector: 'ccs3-op-system-settings-devices',
  templateUrl: 'devices.component.html',
  standalone: true,
  imports: [TranslocoPipe, NoYearDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevicesComponent implements OnInit {
  readonly messageTransportSvc = inject(MessageTransportService);
  readonly internalSubjectsService = inject(InternalSubjectsService);
  readonly signals = this.createSignals();

  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.internalSubjectsService.getSignedIn().pipe(
      filter(isSignedIn => isSignedIn),
      first(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.requestAllDevices());
  }

  requestAllDevices(): void {
    const msg = createGetAllDevicesRequestMessage();
    this.messageTransportSvc.sendAndAwaitForReplyByType<GetAllDevicesRequestMessageBody>(msg)
      .subscribe(getAllDevicesReplyMsg => this.processGetAllDevicesReplyMessage(getAllDevicesReplyMsg));
  }

  processGetAllDevicesReplyMessage(getAllDevicesReplyMsg: GetAllDevicesReplyMessage): void {
    this.signals.allDevices.set(getAllDevicesReplyMsg.body.devices);
  }

  createSignals(): Signals {
    const signals: Signals = {
      allDevices: signal([]),
    };
    return signals;
  }
}

interface Signals {
  allDevices: WritableSignal<Device[]>;
}
