import { Message, ReplyMessage, MessageType } from '../index-declarations';
import { DeviceContinuation } from '../index-entities';

export interface CreateDeviceContinuationRequestMessageBody {
  deviceContinuation: DeviceContinuation;
}

export type CreateDeviceContinuationRequestMessage = Message<CreateDeviceContinuationRequestMessageBody>;

export function createCreateDeviceContinuationRequestMessage(): CreateDeviceContinuationRequestMessage {
  const msg: CreateDeviceContinuationRequestMessage = {
    header: { type: MessageType.createDeviceContinuationRequest },
    body: {} as CreateDeviceContinuationRequestMessageBody,
  };
  return msg;
};


export interface CreateDeviceContinuationReplyMessageBody {
  deviceContinuation: DeviceContinuation;
}

export type CreateDeviceContinuationReplyMessage = ReplyMessage<CreateDeviceContinuationReplyMessageBody>;
