export const enum MessageType {
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
}

export const enum ReplyMessageType {

}

export const enum NotificationMessageType {
  deviceStatusesNotification = 'device-statuses-notification',
}
