import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal,
  WritableSignal
} from '@angular/core';
import { NgClass } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { translate, TranslocoDirective } from '@jsverse/transloco';

import {
  FullDatePipe,
  InternalSubjectsService, MessageTransportService, MoneyFormatPipe, NotificationType,
  TimeConverterService
} from '@ccs3-operator/shared';
import {
  createGetAllUsersRequestMessage, createGetShiftsRequestMessage, GetAllUsersReplyMessage,
  GetShiftsReplyMessage, Shift, ShiftsSummary, User
} from '@ccs3-operator/messages';
import { NotificationsService } from '@ccs3-operator/notifications';

@Component({
  selector: 'ccs3-op-shifts-report',
  templateUrl: 'shifts.component.html',
  imports: [
    ReactiveFormsModule, NgClass, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatCheckboxModule, TranslocoDirective, MoneyFormatPipe, FullDatePipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShiftsComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  readonly signals = this.createSignals();
  readonly form = this.createForm();

  private readonly inernalsSubjectSvc = inject(InternalSubjectsService);
  private readonly messageTransportSvc = inject(MessageTransportService);
  private readonly notificationsSvc = inject(NotificationsService);
  private readonly timeConverterSvc = inject(TimeConverterService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.inernalsSubjectSvc.whenSignedIn().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.init());
  }

  init(): void {
    this.form.patchValue({
      toDate: this.timeConverterSvc.getDateTimeForHTMLInputString(new Date()),
    });
    const getAllUsersReqMsg = createGetAllUsersRequestMessage();
    this.messageTransportSvc.sendAndAwaitForReply(getAllUsersReqMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(replyMsg => this.processGetAllUsersReplyMessage(replyMsg as GetAllUsersReplyMessage));
    this.signals.isReady.set(true);
  }

  processGetAllUsersReplyMessage(replyMsg: GetAllUsersReplyMessage): void {
    if (replyMsg.header.failure) {
      return;
    }
    this.signals.users.set(replyMsg.body.users);
    // Refresh shift items so they get the usernames
    this.refreshLoadedShiftItems();
  }

  refreshLoadedShiftItems(): void {
    this.refreshLoadedShiftItemsUsers();
    this.changeDetectorRef.markForCheck();
  }

  refreshLoadedShiftItemsUsers(): void {
    const loadedShiftItems = this.signals.shiftItems();
    const allUsers = this.signals.users();
    const allUsersMap = new Map<number, User>(allUsers.map(x => [x.id, x]));
    for (const shiftItem of loadedShiftItems) {
      const user = allUsersMap.get(shiftItem.shift.userId);
      if (user) {
        shiftItem.username = user.username;
      }
    }
  }

  onLoadShifts(): void {
    const formValue = this.form.value;
    if (!formValue.fromDate || !formValue.toDate) {
      this.notificationsSvc.show(NotificationType.warn, translate(`Both 'From' and 'To' dates are required`));
      return;
    }
    this.signals.shiftItems.set([]);
    this.signals.shiftsSummary.set(null);
    this.refreshLoadedShiftItems();
    const reqMsg = createGetShiftsRequestMessage();
    const fromDateUTC = new Date(formValue.fromDate).toISOString();
    const toDateUTC = new Date(formValue.toDate).toISOString();
    reqMsg.body.fromDate = fromDateUTC;
    reqMsg.body.toDate = toDateUTC;
    reqMsg.body.userId = formValue.userId;
    this.messageTransportSvc.sendAndAwaitForReply(reqMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(replyMsg => this.processGetShiftsReplyMessage(replyMsg as GetShiftsReplyMessage));
  }

  processGetShiftsReplyMessage(replyMsg: GetShiftsReplyMessage): void {
    if (replyMsg.header.failure) {
      return;
    }
    const shiftItems = replyMsg.body.shifts.map(x => {
      const shiftItem: ShiftItem = {
        shift: x,
        username: '',
        completedTotal: this.roundAmount(x.completedSessionsTotal + x.createdPrepaidTariffsTotal + x.rechargedPrepaidTariffsTotal),
      };
      return shiftItem;
    });
    this.signals.shiftItems.set(shiftItems);
    // Calculate only completed totals
    const completedGrandTotal = shiftItems.reduce((acc, curr) => this.roundAmount(acc + curr.completedTotal), 0);
    this.signals.completedGrandTotal.set(completedGrandTotal);
    this.signals.shiftsSummary.set(replyMsg.body.shiftsSummary);
    this.refreshLoadedShiftItems();
  }

  roundAmount(amount: number): number {
    return Math.round(amount * 100) / 100;
  }

  createForm(): FormGroup<FormControls> {
    const controls: FormControls = {
      fromDate: new FormControl(null, { validators: [Validators.required] }),
      toDate: new FormControl(null, { validators: [Validators.required] }),
      userId: new FormControl(null),
      showCounts: new FormControl(false),
    };
    const form = this.formBuilder.group<FormControls>(controls);
    return form;
  }

  createSignals(): Signals {
    const signals: Signals = {
      shiftItems: signal([]),
      shiftsSummary: signal(null),
      completedGrandTotal: signal(0),
      users: signal([]),
      isReady: signal(false),
    };
    return signals;
  }
}

interface Signals {
  shiftItems: WritableSignal<ShiftItem[]>;
  shiftsSummary: WritableSignal<ShiftsSummary | null>;
  completedGrandTotal: WritableSignal<number>;
  users: WritableSignal<User[]>;
  isReady: WritableSignal<boolean>;
}

interface FormControls {
  fromDate: FormControl<string | null>;
  toDate: FormControl<string | null>;
  userId: FormControl<number | null>;
  showCounts: FormControl<boolean | null>;
}

interface ShiftItem {
  shift: Shift;
  username: string;
  completedTotal: number;
}
