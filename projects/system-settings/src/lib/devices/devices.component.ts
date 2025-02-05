import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';
import { filter, first } from 'rxjs';

import {
  createGetAllDevicesRequestMessage, Device, GetAllDevicesReplyMessage, GetAllDevicesRequestMessageBody
} from '@ccs3-operator/messages';
import { InternalSubjectsService, MessageTransportService, FullDatePipe, RouteNavigationService } from '@ccs3-operator/shared';
import { IconName } from '@ccs3-operator/shared/types';
import { BooleanIndicatorComponent } from '@ccs3-operator/boolean-indicator';

@Component({
  selector: 'ccs3-op-system-settings-devices',
  templateUrl: 'devices.component.html',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, BooleanIndicatorComponent, TranslocoPipe, FullDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevicesComponent implements OnInit {
  readonly messageTransportSvc = inject(MessageTransportService);
  readonly internalSubjectsSvc = inject(InternalSubjectsService);
  readonly routeNavigationSvc = inject(RouteNavigationService);
  readonly signals = this.createSignals();
  readonly iconName = IconName;

  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.internalSubjectsSvc.getSignedIn().pipe(
      filter(isSignedIn => isSignedIn),
      first(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.requestAllDevices());
  }

  onEditDevice(device: Device): void {
    this.routeNavigationSvc.navigateToEditDeviceRequested(device.id);
  }

  requestAllDevices(): void {
    const msg = createGetAllDevicesRequestMessage();
    this.messageTransportSvc.sendAndAwaitForReply<GetAllDevicesRequestMessageBody>(msg)
      .subscribe(getAllDevicesReplyMsg => this.processGetAllDevicesReplyMessage(getAllDevicesReplyMsg as GetAllDevicesReplyMessage));
  }

  processGetAllDevicesReplyMessage(getAllDevicesReplyMsg: GetAllDevicesReplyMessage): void {
    const sortedDevices = getAllDevicesReplyMsg.body.devices.sort((left, right) => left.name ? left.name.localeCompare(right.name!) : -1);
    this.signals.allDevices.set(sortedDevices);
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
