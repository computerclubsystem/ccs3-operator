import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
  public readonly data = inject<ConfirmationComponentData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<MatDialogRef<ConfirmationComponent, boolean>>(MatDialogRef<ConfirmationComponent, boolean>);

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onOk(): void {
    this.dialogRef.close(true);
  }
}
