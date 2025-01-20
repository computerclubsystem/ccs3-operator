export interface DeviceConnectivityItem {
  deviceId?: number | null;
  deviceName?: string | null;
  certificateThumbprint: string;
  connectionsCount: number;
  secondsSinceLastConnected: number;
  messagesCount: number;
  secondsSinceLastMessage?: number | null;
  isConnected: boolean;
}
