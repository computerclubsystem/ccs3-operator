export const SystemSettingType = {
  integer: 'integer',
  number: 'number',
  text: 'text',
  dateTime: 'dateTime'
} as const;
export type SystemSettingType = typeof SystemSettingType[keyof typeof SystemSettingType];
