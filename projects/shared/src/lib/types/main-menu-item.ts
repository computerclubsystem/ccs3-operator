import { MenuItem } from './menu-item';

export enum MainMenuItemId {
  computerStatuses = 'computersStatuses',
  notifications = 'notifications',
  systemSettings = 'systemSettings',
  reports = 'reports',
}

export type MainMenuItem = MenuItem<MainMenuItemId>;
