import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ChangePasswordReplyMessage, createChangePasswordRequestMessage } from '@ccs3-operator/messages';
import { NotificationsService } from '@ccs3-operator/notifications';
import { HashService, MessageTransportService, NotificationType } from '@ccs3-operator/shared';
import { IconName } from '@ccs3-operator/shared/types';
import { translate, TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'ccs3-op-user-profile',
  templateUrl: 'user-profile.component.html',
  imports: [
    ReactiveFormsModule, MatCardModule, MatInputModule, MatFormFieldModule, MatButtonModule,
    TranslocoDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly hashSvc = inject(HashService)
  private readonly messageTransportSvc = inject(MessageTransportService);
  private readonly notificationsSvc = inject(NotificationsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly changePasswordForm = this.hasChangePasswordsNotEqualError();

  async onChangePassword(): Promise<void> {
    const changePwdFormValue = this.changePasswordForm.value;
    const reqMsg = createChangePasswordRequestMessage();
    reqMsg.body.currentPasswordHash = await this.hashSvc.getSha512(changePwdFormValue.currentPassword!);
    reqMsg.body.newPasswordHash = await this.hashSvc.getSha512(changePwdFormValue.newPassword!);
    this.messageTransportSvc.sendAndAwaitForReply(reqMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(replyMsg => this.processChangePasswordReplyMessage(replyMsg as ChangePasswordReplyMessage));
  }

  processChangePasswordReplyMessage(replyMsg: ChangePasswordReplyMessage): void {
    if (replyMsg.header.failure) {
      return;
    }
    this.notificationsSvc.show(NotificationType.success, translate('Password has been changed'), null, IconName.check, replyMsg);
  }

  samePasswordValidator(control: AbstractControl): ValidationErrors | null {
    const form = control as FormGroup<ChangePasswordFormControls>;
    const formValue = form.getRawValue();
    const newPasswordValue = formValue.newPassword;
    const confirmNewPasswordValue = formValue.confirmNewPassword;
    const isWhiteSpace = (string?: string | null): boolean => !(string?.trim());
    if (!isWhiteSpace(newPasswordValue) && !isWhiteSpace(confirmNewPasswordValue) && newPasswordValue === confirmNewPasswordValue) {
      form.controls.newPassword.setErrors(null);
      form.controls.confirmNewPassword.setErrors(null);
    } else {
      form.controls.newPassword.setErrors({ notEqual: true });
      form.controls.confirmNewPassword.setErrors({ notEqual: true });
    }

    return null;
  }

  hasPasswordsNotEqualError(): boolean {
    const notEqualErrorName = 'notEqual';
    return this.changePasswordForm.controls.newPassword.hasError(notEqualErrorName)
      || this.changePasswordForm.controls.confirmNewPassword.hasError(notEqualErrorName);
  }

  hasChangePasswordsNotEqualError(): FormGroup<ChangePasswordFormControls> {
    const controls: ChangePasswordFormControls = {
      currentPassword: new FormControl(null, { validators: [Validators.required] }),
      newPassword: new FormControl(null, { validators: [Validators.required] }),
      confirmNewPassword: new FormControl(null, { validators: [Validators.required] }),
    };
    const form = this.formBuilder.group<ChangePasswordFormControls>(controls, { validators: [this.samePasswordValidator] });
    return form;
  }
}

interface ChangePasswordFormControls {
  currentPassword: FormControl<string | null>;
  newPassword: FormControl<string | null>;
  confirmNewPassword: FormControl<string | null>;
}
