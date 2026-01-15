import { Message, ReplyMessage, MessageType } from '../index-declarations';
import { Device } from '../index-entities';

export interface CreateDeviceRequestMessageBody {
  device: Device;
}

export type CreateDeviceRequestMessage = Message<CreateDeviceRequestMessageBody>;

export function createCreateDeviceRequestMessage(): CreateDeviceRequestMessage {
  const msg: CreateDeviceRequestMessage = {
    header: { type: MessageType.createDeviceRequest },
    body: {} as CreateDeviceRequestMessageBody,
  };
  return msg;
}


export interface CreateDeviceReplyMessageBody {
  device: Device;
}

export type CreateDeviceReplyMessage = ReplyMessage<CreateDeviceReplyMessageBody>;
