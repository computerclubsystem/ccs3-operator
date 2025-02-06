import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { translate, TranslocoDirective } from '@jsverse/transloco';

import {
  createGetAllPermissionsRequestMessage, createGetRoleWithPermissionsRequestMessage,
  createCreateRoleWithPermissionsRequestMessage, GetAllPermissionsReplyMessage,
  GetRoleWithPermissionsReplyMessage, Permission, Role, CreateRoleWithPermissionsReplyMessage,
  createUpdateRoleWithPermissionsRequestMessage, UpdateRoleWithPermissionsReplyMessage
} from '@ccs3-operator/messages';
import { InternalSubjectsService, MessageTransportService, NotificationType, ValidatorsService } from '@ccs3-operator/shared';
import { IconName } from '@ccs3-operator/shared/types';
import { NotificationsService } from '@ccs3-operator/notifications';
import { FormControls } from './declarations';

@Component({
  selector: 'ccs3-op-system-settings-create-role',
  templateUrl: 'create-role.component.html',
  imports: [
    ReactiveFormsModule, MatCardModule, MatCheckboxModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatDividerModule, TranslocoDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateRoleComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly internalSubjectsSvc = inject(InternalSubjectsService);
  private readonly messageTransportSvc = inject(MessageTransportService);
  private readonly notificationsSvc = inject(NotificationsService);
  private readonly validatorsSvc = inject(ValidatorsService);
  private readonly destroyRef = inject(DestroyRef);

  signals = this.createSignals();
  form = this.createForm();
  iconName = IconName;

  ngOnInit(): void {
    this.internalSubjectsSvc.whenSignedIn().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.init());
  }

  init(): void {
    const roleId = this.activatedRoute.snapshot.paramMap.get('roleId');
    this.signals.isCreate.set(!roleId);
    if (roleId) {
      this.loadRoleWithPermissions(+roleId);
    } else {
      this.loadAllPermissions();
    }
  }

  loadRoleWithPermissions(roleId: number): void {
    this.signals.isLoading.set(true);
    const requestMsg = createGetRoleWithPermissionsRequestMessage();
    requestMsg.body.roleId = roleId;
    this.messageTransportSvc.sendAndAwaitForReply(requestMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(getRoleWithPermissionsReplyMsg => this.processGetRoleWithPermissionsReplyMessage(getRoleWithPermissionsReplyMsg as GetRoleWithPermissionsReplyMessage));
  }

  processGetRoleWithPermissionsReplyMessage(getRoleWithPermissionsReplyMsg: GetRoleWithPermissionsReplyMessage): void {
    if (getRoleWithPermissionsReplyMsg.header.failure) {
      return;
    }

    const role = getRoleWithPermissionsReplyMsg.body.role!;
    this.form.patchValue({
      description: role.description,
      enabled: role.enabled,
      name: role.name,
    });
    this.signals.role.set(getRoleWithPermissionsReplyMsg.body.role!);
    this.signals.isLoading.set(false);
    const rolePermissions: Permission[] = [];
    const availablePermissions: Permission[] = [];
    const rolePermissionIdsSet = new Set<number>(getRoleWithPermissionsReplyMsg.body.rolePermissionIds!);
    for (const permission of getRoleWithPermissionsReplyMsg.body.allPermissions!) {
      if (rolePermissionIdsSet.has(permission.id)) {
        rolePermissions.push(permission);
      } else {
        availablePermissions.push(permission);
      }
    }
    this.sortPermissions(rolePermissions);
    this.sortPermissions(availablePermissions);
    this.signals.rolePermissions.set(rolePermissions);
    this.signals.availablePermissions.set(availablePermissions);
  }

  loadAllPermissions(): void {
    const requestMsg = createGetAllPermissionsRequestMessage();
    this.messageTransportSvc.sendAndAwaitForReply(requestMsg).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(getAllPermissionsReplyMsg => this.processGetAllPermissionsReplyMessage(getAllPermissionsReplyMsg as GetAllPermissionsReplyMessage));
  }

  processGetAllPermissionsReplyMessage(getAllPermissionsReplyMsg: GetAllPermissionsReplyMessage): void {
    if (getAllPermissionsReplyMsg.header.failure) {
      return;
    }
    this.sortPermissions(getAllPermissionsReplyMsg.body.permissions);
    this.signals.availablePermissions.set(getAllPermissionsReplyMsg.body.permissions);
  }

  onAddPermission(permission: Permission): void {
    const availablePermissions = this.signals.availablePermissions();
    const rolePermissions = this.signals.rolePermissions();
    this.transferPermission(permission, availablePermissions, rolePermissions);
    this.sortPermissions(rolePermissions);
    this.sortPermissions(availablePermissions);
    this.signals.availablePermissions.set(availablePermissions);
    this.signals.rolePermissions.set(rolePermissions);
  }

  onRemovePermission(permission: Permission): void {
    const availablePermissions = this.signals.availablePermissions();
    const rolePermissions = this.signals.rolePermissions();
    this.transferPermission(permission, rolePermissions, availablePermissions);
    this.sortPermissions(rolePermissions);
    this.sortPermissions(availablePermissions);
    this.signals.availablePermissions.set(availablePermissions);
    this.signals.rolePermissions.set(rolePermissions);
  }

  transferPermission(permission: Permission, sourceArray: Permission[], destinationArray: Permission[]): void {
    sourceArray.splice(sourceArray.findIndex(x => x.id === permission.id), 1);
    destinationArray.push(permission);
  }

  onSave(): void {
    const isCreate = this.signals.isCreate();
    const role = {
      enabled: this.form.value.enabled!,
      name: this.form.value.name!,
      description: this.form.value.description,
    } as Role;
    if (isCreate) {
      const requestMsg = createCreateRoleWithPermissionsRequestMessage();
      requestMsg.body.role = role;
      requestMsg.body.rolePermissionIds = this.signals.rolePermissions().map(x => x.id);
      this.messageTransportSvc.sendAndAwaitForReply(requestMsg).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(createRoleWithPermissionsReplyMsg => this.processCreateRoleWithPermissionsReplyMessage(createRoleWithPermissionsReplyMsg as CreateRoleWithPermissionsReplyMessage));
    } else {
      // Edit existing
      const currentRole = this.signals.role();
      if (currentRole) {
        role.id = this.signals.role()!.id;
        const requestMsg = createUpdateRoleWithPermissionsRequestMessage();
        requestMsg.body.role = role;
        requestMsg.body.rolePermissionIds = this.signals.rolePermissions().map(x => x.id);
        this.messageTransportSvc.sendAndAwaitForReply(requestMsg).pipe(
          takeUntilDestroyed(this.destroyRef)
        ).subscribe(updateRoleWithPermissionsReplyMsg => this.processUpdateRoleWithPermissionsReplyMessage(updateRoleWithPermissionsReplyMsg as UpdateRoleWithPermissionsReplyMessage));

      } else {
        // The role was not loaded
        this.notificationsSvc.show(NotificationType.error, translate(`The role was not loaded`), null, IconName.error, null);
        return;
      }
    }
  }

  processUpdateRoleWithPermissionsReplyMessage(updateRoleWithPermissionsReplyMsg: UpdateRoleWithPermissionsReplyMessage): void {
    if (updateRoleWithPermissionsReplyMsg.header.failure) {
      return;
    }
    this.notificationsSvc.show(NotificationType.success, translate(`The role was updated`), null, IconName.check, updateRoleWithPermissionsReplyMsg);
  }

  processCreateRoleWithPermissionsReplyMessage(createRoleWithPermissionsReplyMsg: CreateRoleWithPermissionsReplyMessage): void {
    if (createRoleWithPermissionsReplyMsg.header.failure) {
      return;
    }
    this.notificationsSvc.show(NotificationType.success, translate(`The role was created`), null, IconName.check, createRoleWithPermissionsReplyMsg);
  }

  onGoToList(): void {
    if (this.signals.isCreate()) {
      // We are in create mode
      this.router.navigate(['../'], { relativeTo: this.activatedRoute });
    } else {
      // We are in edit mode - go back more steps
      this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
    }
  }

  sortPermissions(permissions: Permission[]): void {
    permissions.sort((left, right) => left.name.localeCompare(right.name));
  }

  createForm(): FormGroup<FormControls> {
    const formControls: FormControls = {
      name: new FormControl('', { validators: [Validators.required, this.validatorsSvc.noWhiteSpace] }),
      description: new FormControl(''),
      enabled: new FormControl(true),
    };
    const form = this.formBuilder.group(formControls);
    return form;
  }

  createSignals(): Signals {
    const signals: Signals = {
      isLoading: signal(false),
      isCreate: signal(false),
      role: signal(null),
      allPermissions: signal([]),
      availablePermissions: signal([]),
      rolePermissions: signal([]),
    };
    return signals;
  }
}

interface Signals {
  isLoading: WritableSignal<boolean>;
  isCreate: WritableSignal<boolean>;
  role: WritableSignal<Role | null>;
  allPermissions: WritableSignal<Permission[]>;
  availablePermissions: WritableSignal<Permission[]>;
  rolePermissions: WritableSignal<Permission[]>;
}
