import { MenuItem } from './menu-item';

export enum AccountMenuItemId {
  signIn = 'signIn',
  signOut = 'signOut',
  profileSettings = 'profileSettings',
}

export type AccountMenuItem = MenuItem<AccountMenuItemId>;
