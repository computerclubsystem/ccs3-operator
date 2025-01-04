import { Message } from './declarations/message';
import { MessageType } from './declarations/message-type';

export interface GetDeviceStatusesRequestMessageBody {
}

export interface GetDeviceStatusesRequestMessage extends Message<GetDeviceStatusesRequestMessageBody> {
}

export function createGetDeviceStatusesRequestMessage(): GetDeviceStatusesRequestMessage {
  const msg: GetDeviceStatusesRequestMessage = {
    header: { type: MessageType.getDeviceStatusesRequest },
    body: {} as GetDeviceStatusesRequestMessageBody,
  };
  return msg;
};
