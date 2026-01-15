import { Message, ReplyMessage, MessageType } from '../index-declarations';

export interface DeleteDeviceContinuationRequestMessageBody {
  deviceId: number;
}

export type DeleteDeviceContinuationRequestMessage = Message<DeleteDeviceContinuationRequestMessageBody>;

export function createDeleteDeviceContinuationRequestMessage(): DeleteDeviceContinuationRequestMessage {
  const msg: DeleteDeviceContinuationRequestMessage = {
    header: { type: MessageType.deleteDeviceContinuationRequest },
    body: {} as DeleteDeviceContinuationRequestMessageBody,
  };
  return msg;
}

export type DeleteDeviceContinuationReplyMessageBody = object;

export type DeleteDeviceContinuationReplyMessage = ReplyMessage<DeleteDeviceContinuationReplyMessageBody>;
