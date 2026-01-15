export const UserProfileSettingName = {
  customCss: 'custom_css',
  computerStatusesLayoutRowsCount: 'computer_statuses_layout_rows_count',
  language: 'language',
  actionsAndOptionsButtonsPlacement: `actions_and_options_buttons_placement`,
} as const;
export type UserProfileSettingName = typeof UserProfileSettingName[keyof typeof UserProfileSettingName];

export const UserProfileSettingActionsAndOptionsButtonsPlacementsPossibleValue = {
  start: 'start',
  end: 'end',
} as const;
export type UserProfileSettingActionsAndOptionsButtonsPlacementsPossibleValue = typeof UserProfileSettingActionsAndOptionsButtonsPlacementsPossibleValue[keyof typeof UserProfileSettingActionsAndOptionsButtonsPlacementsPossibleValue];
