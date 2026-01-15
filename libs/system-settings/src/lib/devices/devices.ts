import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoDirective } from '@jsverse/transloco';

import {
  createGetAllDevicesRequestMessage, Device, GetAllDevicesReplyMessage, GetAllDevicesRequestMessageBody
} from '@ccs3-operator/messages';
import {
  InternalSubjectsService, MessageTransportService, FullDatePipe, RouteNavigationService, SorterService, IconName
} from '@ccs3-operator/shared';
import { BooleanIndicatorComponent } from '@ccs3-operator/boolean-indicator';

@Component({
  selector: 'ccs3-op-system-settings-devices',
  templateUrl: 'devices.html',
  imports: [MatButtonModule, MatIconModule, BooleanIndicatorComponent, TranslocoDirective, FullDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevicesComponent implements OnInit {
  readonly messageTransportSvc = inject(MessageTransportService);
  readonly internalSubjectsSvc = inject(InternalSubjectsService);
  readonly routeNavigationSvc = inject(RouteNavigationService);
  readonly sorterSvc = inject(SorterService);
  readonly signals = this.createSignals();
  readonly iconName = IconName;

  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.requestAllDevices();
  }

  onEditDevice(device: Device): void {
    this.routeNavigationSvc.navigateToEditDeviceRequested(device.id);
  }

  onCreateNew(): void {
    this.routeNavigationSvc.navigateToCreateDeviceRequested();
  }

  requestAllDevices(): void {
    const msg = createGetAllDevicesRequestMessage();
    this.messageTransportSvc.sendAndAwaitForReply<GetAllDevicesRequestMessageBody>(msg)
      .subscribe(getAllDevicesReplyMsg => this.processGetAllDevicesReplyMessage(getAllDevicesReplyMsg as GetAllDevicesReplyMessage));
  }

  processGetAllDevicesReplyMessage(getAllDevicesReplyMsg: GetAllDevicesReplyMessage): void {
    this.sorterSvc.sortBy(getAllDevicesReplyMsg.body.devices, x => x.name);
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
