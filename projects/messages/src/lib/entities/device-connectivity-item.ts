export interface DeviceConnectivityItem {
  deviceId?: number | null;
  deviceName?: string | null;
  certificateThumbprint: string;
  connectionsCount: number;
  lastConnectionSince: number;
  messagesCount: number;
  lastMessageSince?: number | null;
  isConnected: boolean;
}
