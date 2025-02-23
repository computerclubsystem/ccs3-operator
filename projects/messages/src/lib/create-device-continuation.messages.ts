import { Message, ReplyMessage } from './declarations/message';
import { MessageType } from './declarations/message-type';
import { DeviceContinuation } from './entities/device-continuation';

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
