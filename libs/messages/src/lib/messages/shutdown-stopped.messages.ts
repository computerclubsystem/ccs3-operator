import { Message, ReplyMessage, MessageType } from '../index-declarations';

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
