import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TranslocoDirective } from '@jsverse/transloco';

import { GetCurrentShiftStatusReplyMessage } from '@ccs3-operator/messages';
import { MoneyFormatterComponent } from '@ccs3-operator/money-formatter';

@Component({
  selector: 'ccs3-op-shift-status',
  templateUrl: 'shift-status.component.html',
  imports: [MatCardModule, MatButtonModule, TranslocoDirective, MoneyFormatterComponent]
})
export class ShiftStatusComponent {
  currentShiftReply = input<GetCurrentShiftStatusReplyMessage | null>(null);
  readonly refreshed = output();
  readonly shiftCompleted = output();

  onRefreshCurrentShiftStatus(): void {
    this.refreshed.emit();
  }

  onCompleteShift(): void {
    this.shiftCompleted.emit();
  }
}
