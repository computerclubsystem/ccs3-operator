import { MenuItem } from './menu-item';

export enum MainMenuItemId {
  copmutersStatus = 'copmutersStatus',
  notifications = 'notifications',
  systemSettings = 'systemSettings',
}

export interface MainMenuItem extends MenuItem<MainMenuItemId> {
}
