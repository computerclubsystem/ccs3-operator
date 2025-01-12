import { Routes } from '@angular/router';

export enum QueryParamName {
  returnUrl = 'returnUrl',
}

export enum RouteName {
  signIn = 'sign-in',
  notifications = 'notifications',
  computersStatus = 'computers-status',
  signedOutSessionStats = 'signed-out-session-stats',
  systemSettings = 'system-settings',
  systemSettingsDevices = 'devices',
  systemSettingsDevicesEdit = 'edit',
  systemSettingsTariffs = 'tariffs',
  systemSettingsTariffsCreate = 'create',
  systemSettingsTariffsEdit = 'edit',
  systemSettingsUsers = 'users',
  systemSettingsRoles = 'roles',
  systemSettingsRolesCreate = 'create',
  systemSettingsRolesEdit = 'edit',
}

export const routes: Routes = [
  {
    path: RouteName.signIn,
    loadComponent: () => import('@ccs3-operator/sign-in').then(x => x.SignInComponent),
  },
  {
    path: RouteName.notifications,
    loadComponent: () => import('@ccs3-operator/notifications').then(x => x.NotificationListComponent),
  },
  {
    path: RouteName.computersStatus,
    loadComponent: () => import('@ccs3-operator/computers-status').then(x => x.ComputersStatusComponent),
  },
  {
    path: RouteName.signedOutSessionStats,
    loadComponent: () => import('@ccs3-operator/signed-out-session-stats').then(x => x.SignedOutSessionStatsComponent),
  },
  {
    path: RouteName.systemSettings,
    loadComponent: () => import('@ccs3-operator/system-settings').then(x => x.SystemSettingsComponent),
    children: [
      {
        path: RouteName.systemSettingsDevices,
        loadComponent: () => import('@ccs3-operator/system-settings/devices').then(x => x.DevicesComponent),
      },
      {
        path: `${RouteName.systemSettingsDevices}/:deviceId/${RouteName.systemSettingsDevicesEdit}`,
        loadComponent: () => import('@ccs3-operator/system-settings/devices/edit').then(x => x.EditDeviceComponent),
      },
      {
        path: RouteName.systemSettingsTariffs,
        loadComponent: () => import('@ccs3-operator/system-settings/tariffs').then(x => x.TariffsComponent),
      },
      {
        path: `${RouteName.systemSettingsTariffs}/${RouteName.systemSettingsTariffsCreate}`,
        loadComponent: () => import('@ccs3-operator/system-settings/tariffs/create').then(x => x.CreateTariffComponent),
      },
      {
        path: `${RouteName.systemSettingsTariffs}/:tariffId/${RouteName.systemSettingsTariffsEdit}`,
        loadComponent: () => import('@ccs3-operator/system-settings/tariffs/create').then(x => x.CreateTariffComponent),
      },
      {
        path: RouteName.systemSettingsUsers,
        loadComponent: () => import('@ccs3-operator/system-settings/users').then(x => x.UsersComponent),
      },
      {
        path: RouteName.systemSettingsRoles,
        loadComponent: () => import('@ccs3-operator/system-settings/roles').then(x => x.RolesComponent),
      },
      {
        path: `${RouteName.systemSettingsRoles}/${RouteName.systemSettingsRolesCreate}`,
        loadComponent: () => import('@ccs3-operator/system-settings/roles/create').then(x => x.CreateRoleComponent),
      },
      {
        path: `${RouteName.systemSettingsRoles}/:roleId/${RouteName.systemSettingsRolesEdit}`,
        loadComponent: () => import('@ccs3-operator/system-settings/roles/create').then(x => x.CreateRoleComponent),
      },
    ]
  },
];
