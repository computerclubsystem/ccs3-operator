import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslocoDirective } from '@jsverse/transloco';

import { MessageTransportService, NotificationType } from '@ccs3-operator/shared';
import { createFilterServerLogsRequestMessage, FilterServerLogsItem, FilterServerLogsReplyMessage } from '@ccs3-operator/messages';
import { NotificationService } from '@ccs3-operator/notification';
import { IconName } from '@ccs3-operator/shared';

@Component({
  selector: 'ccs3-op-filter-server-logs',
  templateUrl: 'filter-server-logs.html',
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatCardModule,
    TranslocoDirective
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterServerLogsComponent implements OnInit {
  serverItems: ServerItem[] = [];
  private readonly formBuilder = inject(FormBuilder);
  readonly form = this.createForm();
  readonly signals = this.createSignals();
  private readonly messageTransportSvc = inject(MessageTransportService);
  private readonly notificationSvc = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.init();
  }

  init(): void {
    //
  }

  onFilter(): void {
    const filterServerLogsItem: FilterServerLogsItem = {
      messageFilter: this.form.value.messageFilter!,
      serviceName: this.form.value.serviceName!
    };
    const reqMsg = createFilterServerLogsRequestMessage();
    reqMsg.body.filterServerLogsItems = [filterServerLogsItem];
    this.messageTransportSvc.sendAndAwaitForReply(reqMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(replyMsg => this.processFilterServerLogsReplyMessage(replyMsg as FilterServerLogsReplyMessage));
  }

  processFilterServerLogsReplyMessage(replyMsg: FilterServerLogsReplyMessage): void {
    if (replyMsg.header.failure) {
      return;
    }
    this.notificationSvc.show(NotificationType.success, 'Server log filtering succeeded', null, IconName.check, replyMsg);
  }

  createSignals(): Signals {
    const signals: Signals = {
      serverItems: signal(this.createServerItems()),
    };
    return signals;
  }

  createForm(): FormGroup<FormControls> {
    const formControls: FormControls = {
      messageFilter: new FormControl(''),
      serviceName: new FormControl(ServiceName.operatorConnector),
    };
    const form = this.formBuilder.group<FormControls>(formControls);
    return form;
  }

  createServerItems(): ServerItem[] {
    const serverItems: ServerItem[] = [
      { serviceName: ServiceName.operatorConnector, displayName: 'Operator connector' },
      { serviceName: ServiceName.pcConnector, displayName: 'PC connector' },
      { serviceName: ServiceName.stateManager, displayName: 'State manager' },
    ];
    return serverItems;
  }
}

const enum ServiceName {
  operatorConnector = 'ccs3/operator-connector',
  pcConnector = 'ccs3/pc-connector',
  stateManager = 'ccs3/state-manager',
}

interface ServerItem {
  serviceName: ServiceName;
  displayName: string;
}

interface FormControls {
  serviceName: FormControl<string | null>;
  messageFilter: FormControl<string | null>;
}


interface Signals {
  serverItems: WritableSignal<ServerItem[]>;
}
