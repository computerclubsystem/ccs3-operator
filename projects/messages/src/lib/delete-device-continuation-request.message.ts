import { Message } from './declarations/message';
import { MessageType } from './declarations/message-type';

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
};
