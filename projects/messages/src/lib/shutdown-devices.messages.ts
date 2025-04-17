import { Message, MessageType, ReplyMessage } from '@ccs3-operator/messages';

export interface ShutdownDevicesRequestMessageBody {
  deviceIds: number[];
}

export type ShutdownDevicesRequestMessage = Message<ShutdownDevicesRequestMessageBody>;

export function createShutdownDevicesRequestMessage(): ShutdownDevicesRequestMessage {
  const msg: ShutdownDevicesRequestMessage = {
    header: { type: MessageType.shutdownDevicesRequest },
    body: {} as ShutdownDevicesRequestMessageBody,
  };
  return msg;
}


export interface ShutdownDevicesReplyMessageBody {
  targetsCount: number;
};

export type ShutdownDevicesReplyMessage = ReplyMessage<ShutdownDevicesReplyMessageBody>;
