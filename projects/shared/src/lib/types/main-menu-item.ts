import { MenuItem } from './menu-item';

export enum MainMenuItemId {
  copmutersStatus = 'copmutersStatus',
  notifications = 'notifications',
  systemSettings = 'systemSettings',
  reports = 'reports',
}

export type MainMenuItem = MenuItem<MainMenuItemId>;
