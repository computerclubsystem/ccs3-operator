import { MenuItem } from './menu-item';

export const AccountMenuItemId = {
  signIn: 'signIn',
  signOut: 'signOut',
  profileSettings: 'profileSettings',
} as const;
export type AccountMenuItemId = typeof AccountMenuItemId[keyof typeof AccountMenuItemId];

export type AccountMenuItem = MenuItem<AccountMenuItemId>;
