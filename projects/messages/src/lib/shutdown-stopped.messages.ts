import { Message, MessageType, ReplyMessage } from '@ccs3-operator/messages';

export type ShutdownStoppedRequestMessageBody = object;

export type ShutdownStoppedRequestMessage = Message<ShutdownStoppedRequestMessageBody>;

export function createShutdownStoppedRequestMessage(): ShutdownStoppedRequestMessage {
  const msg: ShutdownStoppedRequestMessage = {
    header: { type: MessageType.shutdownStoppedRequest },
    body: {},
  };
  return msg;
}


export interface ShutdownStoppedReplyMessageBody {
  targetsCount: number;
}

export type ShutdownStoppedReplyMessage = ReplyMessage<ShutdownStoppedReplyMessageBody>;
