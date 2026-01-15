import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal,
  WritableSignal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { translate, TranslocoDirective } from '@jsverse/transloco';

import { MessageTransportService, NotificationType, IconName } from '@ccs3-operator/shared';
import {
  createGetAllSystemSettingsRequestMessage, createUpdateSystemSettingsValuesRequestMessage,
  GetAllSystemSettingsReplyMessage, SystemSetting, SystemSettingNameWithValue,
  UpdateSystemSettingsValuesReplyMessage
} from '@ccs3-operator/messages';
import { NotificationService } from '@ccs3-operator/notification';

@Component({
  selector: 'ccs3-op-configuration',
  templateUrl: 'configuration.html',
  imports: [MatFormField, MatInputModule, MatDividerModule, MatButtonModule, TranslocoDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigurationComponent implements OnInit {
  readonly signals = this.createSignals();

  private readonly messageTransportSvc = inject(MessageTransportService);
  private readonly notificationSvc = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetectionRef = inject(ChangeDetectorRef);
  private readonly changedSettingsMap = new Map<string, string>();

  ngOnInit(): void {
    this.init();
  }

  init(): void {
    this.loadAllSystemSettings();
  }

  loadAllSystemSettings(): void {
    const reqMsg = createGetAllSystemSettingsRequestMessage();
    this.messageTransportSvc.sendAndAwaitForReply(reqMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(replyMsg => this.processGetAllSystemSettingsReplyMessage(replyMsg as GetAllSystemSettingsReplyMessage));
  }

  processGetAllSystemSettingsReplyMessage(replyMsg: GetAllSystemSettingsReplyMessage): void {
    if (replyMsg.header.failure) {
      return;
    }
    this.setAllSystemSettings(replyMsg.body.systemSettings);
  }

  setAllSystemSettings(allSystemSettings: SystemSetting[]): void {
    this.signals.allSystemSettings.set(allSystemSettings);
    this.changeDetectionRef.markForCheck();
  }

  onSettingValueChanged(setting: SystemSetting, ev: Event): void {
    this.changedSettingsMap.set(setting.name, (ev.target as HTMLInputElement).value);
    this.signals.hasChanges.set(true);
  }

  onSave(): void {
    if (this.changedSettingsMap.size === 0) {
      return;
    }
    const systemSettingsNameWithValues: SystemSettingNameWithValue[] = [];
    for (const mapItem of this.changedSettingsMap.entries()) {
      const name = mapItem[0];
      const value = mapItem[1];
      systemSettingsNameWithValues.push({ name, value });
    }
    const reqMsg = createUpdateSystemSettingsValuesRequestMessage();
    reqMsg.body.systemSettingsNameWithValues = systemSettingsNameWithValues;
    this.messageTransportSvc.sendAndAwaitForReply(reqMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(replyMsg => this.processUpdateSystemSettingsValuesReplyMessage(replyMsg as UpdateSystemSettingsValuesReplyMessage));
  }

  processUpdateSystemSettingsValuesReplyMessage(replyMsg: UpdateSystemSettingsValuesReplyMessage): void {
    if (replyMsg.header.failure) {
      return;
    }
    this.notificationSvc.show(NotificationType.success, translate('Configration saved'), null, IconName.check, replyMsg);
    this.changedSettingsMap.clear();
    this.signals.hasChanges.set(false);
    this.changeDetectionRef.markForCheck();
  }

  createSignals(): Signals {
    const signals: Signals = {
      allSystemSettings: signal([]),
      hasChanges: signal(false),
    };
    return signals;
  }
}

interface Signals {
  allSystemSettings: WritableSignal<SystemSetting[]>;
  hasChanges: WritableSignal<boolean>;
}
