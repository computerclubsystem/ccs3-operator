import { Injectable } from '@angular/core';

import { PermissionName } from './types/permission-name';

@Injectable({ providedIn: 'root' })
export class PermissionsService {
  private permissionsSet = new Set<string>();

  hasPermission(permission: PermissionName): boolean {
    return this.permissionsSet.has(PermissionName.all) || this.permissionsSet.has(permission);
  }

  setPermissions(permissions: PermissionName[]): void {
    this.permissionsSet = new Set<string>(permissions);
  }

  getPermissions(): PermissionName[] {
    return [...this.permissionsSet] as PermissionName[];
  }
}
