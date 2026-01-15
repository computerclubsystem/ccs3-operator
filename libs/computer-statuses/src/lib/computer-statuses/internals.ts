import { DeviceConnectivityConnectionEventItem } from '@ccs3-operator/messages';

export interface DeviceConnectivityDetails {
  deviceId: number;
  receivedMessagesCount: number;
  sentMessagesCount: number;
  secondsSinceLastReceivedMessage?: number | null;
  secondsSinceLastSentMessage?: number | null;
  connectionsCount: number;
  isConnected: boolean;
  connectionEventItems: DeviceConnectivityConnectionEventItem[];
  secondsSinceLastConnection: number;
}
