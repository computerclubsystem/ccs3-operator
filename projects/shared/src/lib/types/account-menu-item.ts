import { MenuItem } from './menu-item';

export enum AccountMenuItemId {
  signIn = 'signIn',
  signOut = 'signOut',
  settings = 'settings',
}

export interface AccountMenuItem extends MenuItem<AccountMenuItemId> {
}
