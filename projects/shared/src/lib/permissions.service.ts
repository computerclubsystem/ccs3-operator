import { Injectable } from '@angular/core';

import { Permission } from './types/permission';

@Injectable({ providedIn: 'root' })
export class PermissionsService {
  private permissionsSet = new Set<string>();

  hasPermission(permission: Permission): boolean {
    return this.permissionsSet.has(Permission.all) || this.permissionsSet.has(permission);
  }

  setPermissions(permissions: Permission[]): void {
    this.permissionsSet = new Set<string>(permissions);
  }
}
