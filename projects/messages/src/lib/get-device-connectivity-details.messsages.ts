import { DeviceConnectivityConnectionEventType, Message, MessageType, ReplyMessage } from '@ccs3-operator/messages';

export interface GetDeviceConnectivityDetailsRequestMessageBody {
  deviceId: number;
}

export type GetDeviceConnectivityDetailsRequestMessage = Message<GetDeviceConnectivityDetailsRequestMessageBody>;

export function createGetDeviceConnectivityDetailsRequestMessage(): GetDeviceConnectivityDetailsRequestMessage {
  const msg: GetDeviceConnectivityDetailsRequestMessage = {
    header: { type: MessageType.getDeviceConnectivityDetailsRequest },
    body: {} as GetDeviceConnectivityDetailsRequestMessageBody,
  };
  return msg;
}

export interface DeviceConnectivityConnectionEventItem {
  timestamp: number;
  connectionId: number;
  connectionInstanceId: string;
  type: DeviceConnectivityConnectionEventType;
  note?: string | null;
}

export interface GetDeviceConnectivityDetailsReplyMessageBody {
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

export type GetDeviceConnectivityDetailsReplyMessage = ReplyMessage<GetDeviceConnectivityDetailsReplyMessageBody>;
