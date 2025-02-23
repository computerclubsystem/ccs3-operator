import { Device } from '@ccs3-operator/messages';
import { Message, ReplyMessage } from './declarations/message';
import { MessageType } from './declarations/message-type';

export interface GetDeviceByIdRequestMessageBody {
  deviceId: number;
}

export type GetDeviceByIdRequestMessage = Message<GetDeviceByIdRequestMessageBody>;

export function createGetDeviceByIdRequestMessage(): GetDeviceByIdRequestMessage {
  const msg: GetDeviceByIdRequestMessage = {
    header: { type: MessageType.getDeviceByIdRequest },
    body: {} as GetDeviceByIdRequestMessageBody,
  };
  return msg;
}

export interface GetDeviceByIdReplyMessageBody {
  device: Device;
}

export type GetDeviceByIdReplyMessage = ReplyMessage<GetDeviceByIdReplyMessageBody>;
