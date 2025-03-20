import { SystemSettingType } from './system-setting-type';

export interface SystemSetting {
  name: string;
  type: SystemSettingType;
  description?: string;
  value?: string;
  allowedValues?: string;
}
