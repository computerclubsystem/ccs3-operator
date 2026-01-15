import { Message, ReplyMessage, MessageType } from '../index-declarations';
import { Device } from '../index-entities';

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
