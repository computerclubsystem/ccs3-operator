import { MenuItem } from './menu-item';

export enum MainMenuItemId {
  computerStatuses = 'computersStatuses',
  notifications = 'notifications',
  systemSettings = 'systemSettings',
  reports = 'reports',
  diagnostics = 'diagnostics',
}

export type MainMenuItem = MenuItem<MainMenuItemId>;
