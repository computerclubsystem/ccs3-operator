import { MenuItem } from './menu-item';

export enum MainMenuItemId {
  copmutersStatus = 'copmutersStatus',
  notifications = 'notifications',
}

export interface MainMenuItem extends MenuItem<MainMenuItemId> {
}
