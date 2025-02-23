import {
  ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, WritableSignal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { translate, TranslocoDirective } from '@jsverse/transloco';
import { forkJoin } from 'rxjs';

import { HashService, InternalSubjectsService, MessageTransportService, NotificationType, ValidatorsService } from '@ccs3-operator/shared';
import {
  createCreateUserWithRolesRequestMessage, createGetAllRolesRequestMessage, createGetUserWithRolesRequestMessage,
  createUpdateUserWithRolesRequestMessage,
  CreateUserWithRolesReplyMessage, GetAllRolesReplyMessage, GetUserWithRolesReplyMessage, Role, UpdateUserWithRolesReplyMessage, User
} from '@ccs3-operator/messages';
import { IconName } from '@ccs3-operator/shared/types';
import { NotificationsService } from '@ccs3-operator/notifications';

@Component({
  selector: 'ccs3-op-system-settings-users-create',
  templateUrl: 'create-user.component.html',
  imports: [
    ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatCardModule,
    MatDividerModule, MatIconModule, TranslocoDirective
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUserComponent implements OnInit {
  signals = this.createSignals();
  iconName = IconName;

  private readonly internalSubjectsSvc = inject(InternalSubjectsService);
  private readonly validatorsSvc = inject(ValidatorsService);
  private readonly messageTransportSvc = inject(MessageTransportService);
  private readonly notificationsSvc = inject(NotificationsService);
  private readonly hashSvc = inject(HashService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  form = this.createForm();

  ngOnInit(): void {
    this.internalSubjectsSvc.whenSignedIn().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.init());
  }

  init(): void {
    const userId = this.activatedRoute.snapshot.paramMap.get('userId');
    this.signals.isCreate.set(!userId);
    this.subscribeToFormValueChanges();
    if (userId) {
      // Edit mode - load user with its roles and also all roles
      this.form.controls.username.disable();
      this.form.patchValue({
        setPassword: false,
      });
      this.loadUserWithRoles(+userId);
    } else {
      // Create mode - load all roles
      this.form.patchValue({
        setPassword: true,
      });
      this.form.controls.setPassword.disable();
      this.loadAllRoles();
    }
  }

  subscribeToFormValueChanges(): void {
    this.form.controls.setPassword.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(setPasswordValue => this.processSetPasswordValueChanged(setPasswordValue!));
  }

  processSetPasswordValueChanged(setPasswordValue: boolean): void {
    this.signals.showPasswords.set(setPasswordValue);
    if (setPasswordValue) {
      this.form.setValidators([this.samePasswordValidator]);
      this.form.controls.password.setValidators([Validators.required, this.validatorsSvc.noWhiteSpace]);
      this.form.controls.confirmPassword.setValidators([Validators.required, this.validatorsSvc.noWhiteSpace]);
    } else {
      this.form.removeValidators(this.samePasswordValidator);
      this.form.controls.password.clearValidators();
      this.form.controls.password.setErrors(null);
      this.form.controls.confirmPassword.clearValidators();
      this.form.controls.confirmPassword.setErrors(null);
    }
  }

  loadUserWithRoles(userId: number): void {
    this.signals.isLoading.set(true);
    const getUserWithRolesRequest = createGetUserWithRolesRequestMessage();
    getUserWithRolesRequest.body.userId = userId;
    const getAllRolesRequest = createGetAllRolesRequestMessage();
    forkJoin([
      this.messageTransportSvc.sendAndAwaitForReply(getUserWithRolesRequest),
      this.messageTransportSvc.sendAndAwaitForReply(getAllRolesRequest),
    ]).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(
      ([userWithRolesReplyMsg, allRolesReplyMsg]) => this.processLoadUserWithRolesResult(userWithRolesReplyMsg as GetUserWithRolesReplyMessage, allRolesReplyMsg as GetAllRolesReplyMessage)
    );
  }

  processLoadUserWithRolesResult(userWithRolesReplyMsg: GetUserWithRolesReplyMessage, allRolesReplyMsg: GetAllRolesReplyMessage): void {
    if (userWithRolesReplyMsg.header.failure || allRolesReplyMsg.header.failure) {
      return;
    }

    const userRoleIdsSet = new Set<number>(userWithRolesReplyMsg.body.roleIds!);
    this.signals.user.set(userWithRolesReplyMsg.body.user!);
    this.signals.allRoles.set(allRolesReplyMsg.body.roles);
    const userRoles: Role[] = [];
    const availableRoles: Role[] = [];
    for (const role of allRolesReplyMsg.body.roles) {
      const isRoleAssignedToUser = userRoleIdsSet.has(role.id);
      if (isRoleAssignedToUser) {
        userRoles.push(role);
      } else {
        availableRoles.push(role);
      }
    }
    this.signals.availableRoles.set(availableRoles);
    this.signals.userRoles.set(userRoles);
    this.setFormData(userWithRolesReplyMsg.body.user!);
    this.signals.isLoading.set(false);
  }

  setFormData(user: User): void {
    this.form.patchValue({
      username: user.username,
      enabled: user.enabled,
    });
  }

  loadAllRoles(): void {
    const requestMsg = createGetAllRolesRequestMessage();
    this.messageTransportSvc.sendAndAwaitForReply(requestMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(getAllRolesReplyMsg => this.processGetAllRolesReplyMessage(getAllRolesReplyMsg as GetAllRolesReplyMessage));
  }

  processGetAllRolesReplyMessage(getAllRolesReplyMsg: GetAllRolesReplyMessage): void {
    if (getAllRolesReplyMsg.header.failure) {
      return;
    }

    this.signals.allRoles.set(getAllRolesReplyMsg.body.roles);
    this.signals.availableRoles.set(getAllRolesReplyMsg.body.roles);
    this.signals.isLoading.set(false);
  }

  onAddRole(role: Role): void {
    const availableRoles = this.signals.availableRoles();
    const userRoles = this.signals.userRoles();
    this.transferRole(role, availableRoles, userRoles);
    this.sortRoles(userRoles);
    this.sortRoles(availableRoles);
    this.signals.availableRoles.set(availableRoles);
    this.signals.userRoles.set(userRoles);
  }

  onRemoveRole(Role: Role): void {
    const availableRoles = this.signals.availableRoles();
    const userRoles = this.signals.userRoles();
    this.transferRole(Role, userRoles, availableRoles);
    this.sortRoles(userRoles);
    this.sortRoles(availableRoles);
    this.signals.availableRoles.set(availableRoles);
    this.signals.userRoles.set(userRoles);
  }

  transferRole(role: Role, sourceArray: Role[], destinationArray: Role[]): void {
    sourceArray.splice(sourceArray.findIndex(x => x.id === role.id), 1);
    destinationArray.push(role);
  }

  sortRoles(roles: Role[]): void {
    roles.sort((left, right) => left.name.localeCompare(right.name));
  }

  samePasswordValidator(control: AbstractControl): ValidationErrors | null {
    const form = control as FormGroup<FormControls>;
    const passwordValue = form.value.password;
    const confirmPasswordValue = form.value.confirmPassword;
    const isWhiteSpace = (string?: string | null): boolean => !(string?.trim());
    if (!isWhiteSpace(passwordValue) && !isWhiteSpace(confirmPasswordValue) && passwordValue === confirmPasswordValue) {
      form.controls.password.setErrors(null);
      form.controls.confirmPassword.setErrors(null);
    } else {
      form.controls.password.setErrors({ notEqual: true });
      form.controls.confirmPassword.setErrors({ notEqual: true });
    }

    return null;
  }

  isWhiteSpace(string?: string | null): boolean {
    return !(string?.trim());
  }

  async onSave(): Promise<void> {
    if (this.signals.isCreate()) {
      const requestMsg = createCreateUserWithRolesRequestMessage();
      requestMsg.body.roleIds = this.signals.userRoles().map(x => x.id);
      const formValue = this.form.value;
      const user = {
        username: formValue.username!,
        enabled: formValue.enabled!,
      } as User;
      requestMsg.body.user = user;
      requestMsg.body.passwordHash = await this.hashSvc.getSha512(formValue.password!);
      this.messageTransportSvc.sendAndAwaitForReply(requestMsg).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(replyMsg => this.processCreateUserWithRolesReplyMessage(replyMsg as CreateUserWithRolesReplyMessage));
    } else {
      const requestMsg = createUpdateUserWithRolesRequestMessage();
      requestMsg.body.roleIds = this.signals.userRoles().map(x => x.id);
      const formValue = this.form.value;
      const user = {
        id: this.signals.user()?.id,
        enabled: formValue.enabled!,
      } as User;
      requestMsg.body.user = user;
      if (formValue.setPassword) {
        requestMsg.body.passwordHash = await this.hashSvc.getSha512(formValue.password!);
      }
      this.messageTransportSvc.sendAndAwaitForReply(requestMsg).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(replyMsg => this.processUpdateUserWithRolesReplyMessage(replyMsg as UpdateUserWithRolesReplyMessage));
    }
  }

  processUpdateUserWithRolesReplyMessage(replyMsg: UpdateUserWithRolesReplyMessage): void {
    if (replyMsg.header.failure) {
      return;
    }
    this.notificationsSvc.show(NotificationType.success, translate('User updated'), null, IconName.check, replyMsg);
  }

  processCreateUserWithRolesReplyMessage(replyMsg: CreateUserWithRolesReplyMessage): void {
    if (replyMsg.header.failure) {
      return;
    }
    this.notificationsSvc.show(NotificationType.success, translate('User created'), null, IconName.check, replyMsg);
  }

  hasPasswordsNotEqualError(): boolean {
    if (!this.form.value.setPassword) {
      return false;
    }
    const notEqualErrorName = 'notEqual';
    return this.form.controls.password.hasError(notEqualErrorName)
      || this.form.controls.confirmPassword.hasError(notEqualErrorName);
  }

  onGoToList(): void {
    if (this.signals.isCreate()) {
      this.router.navigate(['..'], { relativeTo: this.activatedRoute });
    } else {
      this.router.navigate(['../..'], { relativeTo: this.activatedRoute });
    }
  }

  createForm(): FormGroup<FormControls> {
    const formControls: FormControls = {
      username: new FormControl('', { validators: [Validators.required, this.validatorsSvc.noWhiteSpace] }),
      // TODO: Passwords can contain leading or trailing whitespace characters but this.validatorsSvc.noWhiteSpace validator will report error
      password: new FormControl(''),
      confirmPassword: new FormControl(''),
      enabled: new FormControl(true),
      setPassword: new FormControl(false),
    };
    const form = this.formBuilder.group(formControls);
    return form;
  }

  createSignals(): Signals {
    const signals: Signals = {
      isCreate: signal(false),
      isLoading: signal(false),
      user: signal(null),
      allRoles: signal([]),
      availableRoles: signal([]),
      userRoles: signal([]),
      showPasswords: signal(false),
    };
    return signals;
  }
}

interface Signals {
  isCreate: WritableSignal<boolean>;
  isLoading: WritableSignal<boolean>;
  user: WritableSignal<User | null>;
  allRoles: WritableSignal<Role[]>;
  userRoles: WritableSignal<Role[]>;
  availableRoles: WritableSignal<Role[]>;
  showPasswords: WritableSignal<boolean>;
}

interface FormControls {
  username: FormControl<string | null>;
  setPassword: FormControl<boolean | null>;
  password: FormControl<string | null>;
  confirmPassword: FormControl<string | null>;
  enabled: FormControl<boolean | null>;
}
