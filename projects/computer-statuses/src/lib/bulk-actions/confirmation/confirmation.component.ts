import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslocoDirective } from '@jsverse/transloco';

import { ConfirmationComponentData } from './declarations';

@Component({
  selector: 'ccs3-op-confirmation',
  templateUrl: 'confirmation.component.html',
  imports: [MatDialogContent, MatDialogActions, MatButtonModule, TranslocoDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: ConfirmationComponentData,
    private readonly dialogRef: MatDialogRef<ConfirmationComponent, boolean>,
  ) { }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onOk(): void {
    this.dialogRef.close(true);
  }
}
