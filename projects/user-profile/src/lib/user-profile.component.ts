import {
  ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, WritableSignal
} from '@angular/core';
import {
  AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { translate, TranslocoDirective } from '@jsverse/transloco';

import {
  ChangePasswordReplyMessage, createChangePasswordRequestMessage, createGetProfileSettingsRequestMessage,
  createUpdateProfileSettingsRequestMessage, GetProfileSettingsReplyMessage, UpdateProfileSettingsReplyMessage,
  UserProfileSettingActionsAndOptionsButtonsPlacementsPossibleValue, UserProfileSettingName,
  UserProfileSettingWithValue
} from '@ccs3-operator/messages';
import { NotificationsService } from '@ccs3-operator/notifications';
import { HashService, InternalSubjectsService, MessageTransportService, NotificationType } from '@ccs3-operator/shared';
import { IconName } from '@ccs3-operator/shared/types';

@Component({
  selector: 'ccs3-op-user-profile',
  templateUrl: 'user-profile.component.html',
  imports: [
    ReactiveFormsModule, MatCardModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatRadioModule,
    MatDividerModule, TranslocoDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly hashSvc = inject(HashService);
  private readonly internalsSubjectSvc = inject(InternalSubjectsService);
  private readonly messageTransportSvc = inject(MessageTransportService);
  private readonly notificationsSvc = inject(NotificationsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly signals = this.createSignals();
  readonly changePasswordForm = this.createChangePasswordForm();
  readonly customStyleForm = this.createCustomStyleForm();
  readonly actionsAndOptionsButtonsPlacementForm = this.createActionsAndOptionsButtonsPlacementForm();
  readonly actionsAndOptionsButtonsPlacement = UserProfileSettingActionsAndOptionsButtonsPlacementsPossibleValue;

  ngOnInit(): void {
    this.internalsSubjectSvc.whenSignedIn().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.init());
  }

  init(): void {
    const profileReqMsg = createGetProfileSettingsRequestMessage();
    this.messageTransportSvc.sendAndAwaitForReply(profileReqMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(replyMsg => this.processGetProfileSettingsReplyMessage(replyMsg as GetProfileSettingsReplyMessage));
  }

  processGetProfileSettingsReplyMessage(replyMsg: GetProfileSettingsReplyMessage): void {
    if (replyMsg.header.failure) {
      return;
    }
    const settings = replyMsg.body.settings;
    this.signals.profileReplyMessage.set(replyMsg);

    this.setCustomStyleFormValue(settings);
    this.setActionsAndOptionsButtonsPlacementFormValue(settings);
  }

  setActionsAndOptionsButtonsPlacementFormValue(settings: UserProfileSettingWithValue[]): void {
    const actionsAndOptionsButtonsPlacementSetting = settings.find(x => x.name === UserProfileSettingName.actionsAndOptionsButtonsPlacement);
    this.signals.actionsAndOptionsButtonsPlacementSetting.set(actionsAndOptionsButtonsPlacementSetting);
    let placementValue = actionsAndOptionsButtonsPlacementSetting?.value;
    if (placementValue !== UserProfileSettingActionsAndOptionsButtonsPlacementsPossibleValue.start
      && placementValue !== UserProfileSettingActionsAndOptionsButtonsPlacementsPossibleValue.end
    ) {
      placementValue = UserProfileSettingActionsAndOptionsButtonsPlacementsPossibleValue.start;
    }
    this.actionsAndOptionsButtonsPlacementForm.patchValue({
      placement: placementValue,
    });
  }

  setCustomStyleFormValue(settings: UserProfileSettingWithValue[]): void {
    const customStylesProfileSetting = settings.find(x => x.name === UserProfileSettingName.customCss);
    this.signals.customStylesSetting.set(customStylesProfileSetting);
    this.customStyleForm.patchValue({
      customStyle: customStylesProfileSetting?.value,
    });
  }

  onSaveActionsAndOptionsButtonsPlacement(): void {
    const formValue = this.actionsAndOptionsButtonsPlacementForm.value;
    const reqMsg = createUpdateProfileSettingsRequestMessage();
    reqMsg.body.profileSettings = [
      {
        name: UserProfileSettingName.actionsAndOptionsButtonsPlacement,
        value: formValue.placement,
      },
    ];
    this.messageTransportSvc.sendAndAwaitForReply(reqMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(replyMsg => this.processUpdateActionsAndOptionsButtonsPlacementReplyMessage(replyMsg as UpdateProfileSettingsReplyMessage));
  }

  processUpdateActionsAndOptionsButtonsPlacementReplyMessage(replyMsg: UpdateProfileSettingsReplyMessage): void {
    if (replyMsg.header.failure) {
      return;
    }
    this.notificationsSvc.show(NotificationType.success, translate('Actions and Options buttons placement saved'), null, IconName.check, replyMsg);
  }

  onSaveCustomCss(): void {
    const formValue = this.customStyleForm.value;
    const reqMsg = createUpdateProfileSettingsRequestMessage();
    reqMsg.body.profileSettings = [
      {
        name: UserProfileSettingName.customCss,
        value: formValue.customStyle,
      },
    ];
    this.messageTransportSvc.sendAndAwaitForReply(reqMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(replyMsg => this.processUpdateCustomCssReplyMessage(replyMsg as UpdateProfileSettingsReplyMessage));
  }

  processUpdateCustomCssReplyMessage(replyMsg: UpdateProfileSettingsReplyMessage): void {
    if (replyMsg.header.failure) {
      return;
    }
    this.notificationsSvc.show(NotificationType.success, translate('Custom CSS saved'), null, IconName.check, replyMsg);
  }

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

  createChangePasswordForm(): FormGroup<ChangePasswordFormControls> {
    const controls: ChangePasswordFormControls = {
      currentPassword: new FormControl(null, { validators: [Validators.required] }),
      newPassword: new FormControl(null, { validators: [Validators.required] }),
      confirmNewPassword: new FormControl(null, { validators: [Validators.required] }),
    };
    const form = this.formBuilder.group<ChangePasswordFormControls>(controls, { validators: [this.samePasswordValidator] });
    return form;
  }

  createCustomStyleForm(): FormGroup<CustomStyleFormControls> {
    const controls: CustomStyleFormControls = {
      customStyle: new FormControl(null),
    };
    const form = this.formBuilder.group<CustomStyleFormControls>(controls);
    return form;
  }

  createActionsAndOptionsButtonsPlacementForm(): FormGroup<ActionsAndOptionsButtonsPlacementFormControls> {
    const controls: ActionsAndOptionsButtonsPlacementFormControls = {
      placement: new FormControl(UserProfileSettingActionsAndOptionsButtonsPlacementsPossibleValue.start),
    };
    const form = this.formBuilder.group<ActionsAndOptionsButtonsPlacementFormControls>(controls);
    return form;
  }

  createSignals(): Signals {
    const signals: Signals = {
      profileReplyMessage: signal(null),
      customStylesSetting: signal(null),
      actionsAndOptionsButtonsPlacementSetting: signal(null),
    };
    return signals;
  }
}

interface ChangePasswordFormControls {
  currentPassword: FormControl<string | null>;
  newPassword: FormControl<string | null>;
  confirmNewPassword: FormControl<string | null>;
}

interface CustomStyleFormControls {
  customStyle: FormControl<string | null>;
}

interface ActionsAndOptionsButtonsPlacementFormControls {
  placement: FormControl<string | null>;
}

interface Signals {
  profileReplyMessage: WritableSignal<GetProfileSettingsReplyMessage | null>;
  customStylesSetting: WritableSignal<UserProfileSettingWithValue | undefined | null>;
  actionsAndOptionsButtonsPlacementSetting: WritableSignal<UserProfileSettingWithValue | undefined | null>;
}
