import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslocoDirective } from '@jsverse/transloco';

import { GetCurrentShiftStatusReplyMessage } from '@ccs3-operator/messages';
import { MoneyFormatterComponent } from '@ccs3-operator/money-formatter';
import { ShiftCompletedEventArgs } from './declarations';

@Component({
  selector: 'ccs3-op-shift-status',
  templateUrl: 'shift-status.component.html',
  imports: [
    ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatCheckboxModule, TranslocoDirective, MoneyFormatterComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShiftStatusComponent {
  currentShiftReply = input<GetCurrentShiftStatusReplyMessage | null>(null);
  readonly refreshed = output();
  readonly shiftCompleted = output<ShiftCompletedEventArgs>();

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
}

interface FormControls {
  shiftNote: FormControl<string | null>;
}
