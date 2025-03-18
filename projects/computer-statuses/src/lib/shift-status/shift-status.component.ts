import { ChangeDetectionStrategy, Component, inject, input, output, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { TranslocoDirective } from '@jsverse/transloco';

import { GetCurrentShiftStatusReplyMessage } from '@ccs3-operator/messages';
import { MoneyFormatterComponent } from '@ccs3-operator/money-formatter';
import { ShiftCompletedEventArgs } from './declarations';
import { NoYearDatePipe } from '@ccs3-operator/shared';
import { ExpandButtonComponent, ExpandButtonType } from '@ccs3-operator/expand-button';

@Component({
  selector: 'ccs3-op-shift-status',
  templateUrl: 'shift-status.component.html',
  imports: [
    ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatExpansionModule,
    MatCheckboxModule, MatDividerModule, TranslocoDirective, MoneyFormatterComponent, ExpandButtonComponent, NoYearDatePipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShiftStatusComponent {
  currentShiftReply = input<GetCurrentShiftStatusReplyMessage | null>(null);
  lastShiftCompletedAt = input<string | null>();
  lastShiftCompletedBy = input<string | null>();
  readonly refreshed = output();
  readonly shiftCompleted = output<ShiftCompletedEventArgs>();
  readonly expandButtonType = ExpandButtonType;

  readonly signals = this.createSignals();
  private readonly formBuilder = inject(FormBuilder);
  form = this.createForm();

  onRefreshCurrentShiftStatus(): void {
    this.refreshed.emit();
  }

  onCompleteShift(): void {
    const args: ShiftCompletedEventArgs = {
      note: this.form.value.shiftNote,
    };
    this.shiftCompleted.emit(args);
  }

  createForm(): FormGroup<FormControls> {
    const controls: FormControls = {
      shiftNote: new FormControl<string | null>(null),
    };
    const form = this.formBuilder.group(controls);
    return form;
  }

  toggleDetails(): void {
    this.signals.detailsExpanded.set(!this.signals.detailsExpanded());
  }

  createSignals(): Signals {
    const signals: Signals = {
      detailsExpanded: signal(false),
    };
    return signals;
  }
}

interface FormControls {
  shiftNote: FormControl<string | null>;
}

interface Signals {
  detailsExpanded: WritableSignal<boolean>;
}
