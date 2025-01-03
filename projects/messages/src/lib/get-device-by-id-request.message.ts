import { Message } from './declarations/message';
import { MessageType } from './declarations/message-type';

export interface GetDeviceByIdRequestMessageBody {
  deviceId: number;
}

export interface GetDeviceByIdRequestMessage extends Message<GetDeviceByIdRequestMessageBody> {
}

export function createGetDeviceByIdRequestMessage(): GetDeviceByIdRequestMessage {
  const msg: GetDeviceByIdRequestMessage = {
    header: { type: MessageType.getDeviceByIdRequest },
    body: {} as GetDeviceByIdRequestMessageBody,
  };
  return msg;
};
