import { MenuItem } from './menu-item';

export const MainMenuItemId = {
  computerStatuses: 'computersStatuses',
  notifications: 'notifications',
  systemSettings: 'systemSettings',
  reports: 'reports',
  diagnostics: 'diagnostics',
} as const;
export type MainMenuItemId = typeof MainMenuItemId[keyof typeof MainMenuItemId];

export type MainMenuItem = MenuItem<MainMenuItemId>;
