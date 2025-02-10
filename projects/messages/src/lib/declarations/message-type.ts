export const enum MessageType {
  updateSystemSettingsValuesRequest = 'update-system-settings-values-request',
  updateSystemSettingsValuesReply = 'update-system-settings-values-reply',
  getAllSystemSettingsRequest = 'get-all-system-settings-request',
  getAllSystemSettingsReply = 'get-all-system-settings-reply',
  authRequest = 'auth-request',
  authReply = 'auth-reply',
  configuration = 'configuration',
  pingRequest = 'ping-request',
  refreshTokenRequest = 'refresh-token-request',
  refreshTokenReply = 'refresh-token-reply',
  notAuthenticated = 'not-authenticated',
  signOutRequest = 'sign-out-request',
  signOutReply = 'sign-out-reply',
  getAllDevicesRequest = 'get-all-devices-request',
  getAllDevicesReply = 'get-all-devices-reply',
  getDeviceByIdRequest = 'get-device-by-id-request',
  getDeviceByIdReply = 'get-device-by-id-reply',
  updateDeviceRequest = 'update-device-request',
  updateDeviceReply = 'update-device-reply',
  getAllTariffsRequest = 'get-all-tariffs-request',
  getAllTariffsReply = 'get-all-tariffs-reply',
  getTariffByIdRequest = 'get-tariff-by-id-request',
  getTariffByIdReply = 'get-tariff-by-id-reply',
  createTariffRequest = 'create-tariff-request',
  createTariffReply = 'create-tariff-reply',
  updateTariffRequest = 'update-tariff-request',
  updateTariffReply = 'update-tariff-reply',
  startDeviceRequest = 'start-device-request',
  startDeviceReply = 'start-device-reply',
  getDeviceStatusesRequest = 'get-device-statuses-request',
  getDeviceStatusesReply = 'get-device-statuses-reply',
  getAllRolesRequest = 'get-all-roles-request',
  getAllRolesReply = 'get-all-roles-reply',
  getRoleWithPermissionsRequest = 'get-role-with-permissions-request',
  getRoleWithPermissionsReply = 'get-role-with-permissions-reply',
  createRoleWithPermissionsRequest = 'create-role-with-permissions-request',
  createRoleWithPermissionsReply = 'create-role-with-permissions-reply',
  updateRoleWithPermissionsRequest = 'update-role-with-permissions-request',
  updateRoleWithPermissionsReply = 'update-role-with-permissions-reply',
  getAllPermissionsRequest = 'get-all-permissions-request',
  getAllPermissionsReply = 'get-all-permissions-reply',
  getAllUsersRequest = 'get-all-users-request',
  getAllUsersReply = 'get-all-users-reply',
  getUserWithRolesRequest = 'get-user-with-roles-request',
  getUserWithRolesReply = 'get-user-with-roles-reply',
  createUserWithRolesRequest = 'create-user-with-roles-request',
  createUserWithRolesReply = 'create-user-with-roles-reply',
  updateUserWithRolesRequest = 'update-user-with-roles-request',
  updateUserWithRolesReply = 'update-user-with-roles-reply',
  stopDeviceRequest = 'stop-device-request',
  stopDeviceReply = 'stop-device-reply',
  transferDeviceRequest = 'transfer-device-request',
  transferDeviceReply = 'transfer-device-reply',
  createDeviceContinuationRequest = 'create-device-continuation-request',
  createDeviceContinuationReply = 'create-device-continuation-reply',
  deleteDeviceContinuationRequest = 'delete-device-continuation-request',
  deleteDeviceContinuationReply = 'delete-device-continuation-reply',
  rechargeTariffDurationRequest = 'recharge-tariff-duration-request',
  rechargeTariffDurationReply = 'recharge-tariff-duration-reply',
  getSignedInUsersRequest = 'get-signed-in-users-request',
  getSignedInUsersReply = 'get-signed-in-users-reply',
  forceSignOutAllUserSessionsRequest = 'force-sign-out-all-user-sessions-request',
  forceSignOutAllUserSessionsReply = 'force-sign-out-all-user-sessions-reply',
  getCurrentShiftStatusRequest = 'get-current-shift-status-request',
  getCurrentShiftStatusReply = 'get-current-shift-status-reply',
  completeShiftRequest = 'complete-shift-request',
  completeShiftReply = 'complete-shift-reply',
  getShiftsRequest = 'get-shifts-request',
  getShiftsReply = 'get-shifts-reply',
}

export const enum ReplyMessageType {

}

export const enum NotificationMessageType {
  deviceStatusesNotification = 'device-statuses-notification',
  deviceConnectivitiesNotification = 'device-connectivities-notification',
  signedOutNotification = 'signed-out-notification',
}
