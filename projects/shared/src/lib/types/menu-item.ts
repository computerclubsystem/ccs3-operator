import { IconName } from './icon-name';

export interface MenuItem<TId> {
    id: TId;
    icon?: IconName;
    text?: string;
    translationKey?: string;
}
