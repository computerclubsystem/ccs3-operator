import {
  ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, WritableSignal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoDirective } from '@jsverse/transloco';

import {
  createGetAllDeviceGroupsRequestMessage, DeviceGroup, GetAllDeviceGroupsReplyMessage
} from '@ccs3-operator/messages';
import { MessageTransportService, RouteNavigationService, SorterService, IconName } from '@ccs3-operator/shared';
import { BooleanIndicatorComponent } from '@ccs3-operator/boolean-indicator';

@Component({
  selector: 'ccs3-op-system-settings-device-groups',
  templateUrl: 'device-groups.html',
  imports: [MatButtonModule, MatIconModule, TranslocoDirective, BooleanIndicatorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeviceGroupsComponent implements OnInit {
  readonly signals = this.createSignals();
  readonly iconName = IconName;
  private readonly messageTransportSvc = inject(MessageTransportService);
  private readonly routeNavigationSvc = inject(RouteNavigationService);
  private readonly sorterSvc = inject(SorterService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.init();
  }

  init(): void {
    this.loadAllDeviceGroups();
  }

  loadAllDeviceGroups(): void {
    const reqMsg = createGetAllDeviceGroupsRequestMessage();
    this.messageTransportSvc.sendAndAwaitForReply(reqMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(replyMsg => this.processGetAllDeviceGroupsReplyMessage(replyMsg as GetAllDeviceGroupsReplyMessage));
  }

  processGetAllDeviceGroupsReplyMessage(replyMsg: GetAllDeviceGroupsReplyMessage): void {
    if (replyMsg.header.failure) {
      return;
    }
    this.sorterSvc.sortBy(replyMsg.body.deviceGroups, x => x.name);
    this.signals.deviceGroups.set(replyMsg.body.deviceGroups);
  }

  onEditDeviceGroup(deviceGroup: DeviceGroup): void {
    this.routeNavigationSvc.navigateToEditDeviceGroupRequested(deviceGroup.id);
  }

  onCreateNew(): void {
    this.routeNavigationSvc.navigateToCreateDeviceGroupRequested();
  }

  createSignals(): Signals {
    const signals: Signals = {
      deviceGroups: signal(null),
    };
    return signals;
  }
}

interface Signals {
  deviceGroups: WritableSignal<DeviceGroup[] | null>;
}
