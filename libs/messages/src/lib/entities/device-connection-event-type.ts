export const DeviceConnectivityConnectionEventType = {
  connected: 'connected',
  disconnected: 'disconnected',
  idleTimeout: 'idle-timeout',
  noMessagesReceived: 'no-messages-received',
}as const;
export type DeviceConnectivityConnectionEventType = typeof DeviceConnectivityConnectionEventType[keyof typeof DeviceConnectivityConnectionEventType];
