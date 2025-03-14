import { Routes } from '@angular/router';

export enum QueryParamName {
  returnUrl = 'returnUrl',
}

export enum RouteName {
  diagnostics = 'diagnostics',
  diagnosticsFilterServerLogs = 'filter-server-logs',
  signIn = 'sign-in',
  notifications = 'notifications',
  computerStatuses = 'computer-statuses',
  signedOutSessionStats = 'signed-out-session-stats',
  systemSettings = 'system-settings',
  systemSettingsDeviceGroups = 'device-groups',
  systemSettingsDevices = 'devices',
  systemSettingsTariffs = 'tariffs',
  systemSettingsPrepaidTariffs = 'prepaid-tariffs',
  systemSettingsUsers = 'users',
  systemSettingsRoles = 'roles',
  systemSettingsConfiguration = 'configuration',
  sharedRouteCreate = 'create',
  sharedRouteEdit = 'edit',
  reports = 'reports',
  reportsSignedInUsers = 'signed-in-users',
  reportsShifts = 'shifts',
  reportsDeviceSessions = 'device-sessions',
  signedOutByAdministrator = 'signed-out-by-administrator',
  profileSettings = 'user-profile',
}

export const routes: Routes = [
  {
    path: RouteName.profileSettings,
    loadComponent: () => import('@ccs3-operator/user-profile').then(x => x.UserProfileComponent),
  },
  {
    path: RouteName.signedOutByAdministrator,
    // loadComponent: () => import('@ccs3-operator/signed-out-by-administrator').then(x => x.SignedOutByAdministratorComponent),
    loadComponent: async () => (await import('@ccs3-operator/signed-out-by-administrator')).SignedOutByAdministratorComponent,
  },
  {
    path: RouteName.signIn,
    loadComponent: () => import('@ccs3-operator/sign-in').then(x => x.SignInComponent),
  },
  {
    path: RouteName.notifications,
    loadComponent: () => import('@ccs3-operator/notifications').then(x => x.NotificationListComponent),
  },
  {
    path: RouteName.computerStatuses,
    loadComponent: () => import('@ccs3-operator/computer-statuses').then(x => x.ComputerStatusesComponent),
  },
  {
    path: RouteName.signedOutSessionStats,
    loadComponent: () => import('@ccs3-operator/signed-out-session-stats').then(x => x.SignedOutSessionStatsComponent),
  },
  {
    path: RouteName.diagnostics,
    loadComponent: () => import('@ccs3-operator/diagnostics').then(x => x.DiagnosticsComponent),
    children: [
      {
        path: RouteName.diagnosticsFilterServerLogs,
        loadComponent: () => import('@ccs3-operator/diagnostics/filter-server-logs').then(x => x.FilterServerLogsComponent),
      },
    ],
  },
  {
    path: RouteName.systemSettings,
    loadComponent: () => import('@ccs3-operator/system-settings').then(x => x.SystemSettingsComponent),
    children: [
      {
        path: RouteName.systemSettingsDeviceGroups,
        loadComponent: () => import('@ccs3-operator/system-settings/device-groups').then(x => x.DeviceGroupsComponent),
      },
      {
        path: `${RouteName.systemSettingsDeviceGroups}/${RouteName.sharedRouteCreate}`,
        loadComponent: () => import('@ccs3-operator/system-settings/device-groups/create').then(x => x.CreateDeviceGroupComponent),
      },
      {
        path: `${RouteName.systemSettingsDeviceGroups}/:deviceGroupId/${RouteName.sharedRouteEdit}`,
        loadComponent: () => import('@ccs3-operator/system-settings/device-groups/create').then(x => x.CreateDeviceGroupComponent),
      },
      {
        path: RouteName.systemSettingsDevices,
        loadComponent: () => import('@ccs3-operator/system-settings/devices').then(x => x.DevicesComponent),
      },
      {
        path: `${RouteName.systemSettingsDevices}/${RouteName.sharedRouteCreate}`,
        loadComponent: () => import('@ccs3-operator/system-settings/devices/create').then(x => x.CreateDeviceComponent),
      },
      {
        path: `${RouteName.systemSettingsDevices}/:deviceId/${RouteName.sharedRouteEdit}`,
        loadComponent: () => import('@ccs3-operator/system-settings/devices/create').then(x => x.CreateDeviceComponent),
      },
      {
        path: RouteName.systemSettingsTariffs,
        loadComponent: () => import('@ccs3-operator/system-settings/tariffs').then(x => x.TariffsComponent),
      },
      {
        path: `${RouteName.systemSettingsTariffs}/${RouteName.sharedRouteCreate}`,
        loadComponent: () => import('@ccs3-operator/system-settings/tariffs/create').then(x => x.CreateTariffComponent),
      },
      {
        path: `${RouteName.systemSettingsTariffs}/:tariffId/${RouteName.sharedRouteEdit}`,
        loadComponent: () => import('@ccs3-operator/system-settings/tariffs/create').then(x => x.CreateTariffComponent),
      },
      {
        path: RouteName.systemSettingsPrepaidTariffs,
        loadComponent: () => import('@ccs3-operator/system-settings/prepaid-tariffs').then(x => x.PrepaidTariffsComponent),
      },
      {
        path: `${RouteName.systemSettingsPrepaidTariffs}/${RouteName.sharedRouteCreate}`,
        loadComponent: () => import('@ccs3-operator/system-settings/prepaid-tariffs/create').then(x => x.CreatePrepaidTariffComponent),
      },
      {
        path: `${RouteName.systemSettingsPrepaidTariffs}/:tariffId/${RouteName.sharedRouteEdit}`,
        loadComponent: () => import('@ccs3-operator/system-settings/prepaid-tariffs/create').then(x => x.CreatePrepaidTariffComponent),
      },
      {
        path: RouteName.systemSettingsUsers,
        loadComponent: () => import('@ccs3-operator/system-settings/users').then(x => x.UsersComponent),
      },
      {
        path: `${RouteName.systemSettingsUsers}/${RouteName.sharedRouteCreate}`,
        loadComponent: () => import('@ccs3-operator/system-settings/users/create').then(x => x.CreateUserComponent),
      },
      {
        path: `${RouteName.systemSettingsUsers}/:userId/${RouteName.sharedRouteEdit}`,
        loadComponent: () => import('@ccs3-operator/system-settings/users/create').then(x => x.CreateUserComponent),
      },
      {
        path: RouteName.systemSettingsRoles,
        loadComponent: () => import('@ccs3-operator/system-settings/roles').then(x => x.RolesComponent),
      },
      {
        path: `${RouteName.systemSettingsRoles}/${RouteName.sharedRouteCreate}`,
        loadComponent: () => import('@ccs3-operator/system-settings/roles/create').then(x => x.CreateRoleComponent),
      },
      {
        path: `${RouteName.systemSettingsRoles}/:roleId/${RouteName.sharedRouteEdit}`,
        loadComponent: () => import('@ccs3-operator/system-settings/roles/create').then(x => x.CreateRoleComponent),
      },
      {
        path: RouteName.systemSettingsConfiguration,
        loadComponent: () => import('@ccs3-operator/system-settings/configuration').then(x => x.ConfigurationComponent),
      },
    ]
  },
  {
    path: RouteName.reports,
    loadComponent: () => import('@ccs3-operator/reports').then(x => x.ReportsComponent),
    children: [
      {
        path: RouteName.reportsSignedInUsers,
        loadComponent: () => import('@ccs3-operator/reports/signed-in-users').then(x => x.SignedInUsersComponent),
      },
      {
        path: RouteName.reportsShifts,
        loadComponent: () => import('@ccs3-operator/reports/shifts').then(x => x.ShiftsComponent),
      },
      {
        path: RouteName.reportsDeviceSessions,
        loadComponent: () => import('@ccs3-operator/reports/device-sessions').then(x => x.DeviceSessionsComponent),
      },
    ],
  }
];
