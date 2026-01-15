import { Message, ReplyMessage, MessageType } from '../index-declarations';
import { Device } from '../index-entities';

export type GetAllDevicesRequestMessageBody = object;

export type GetAllDevicesRequestMessage = Message<GetAllDevicesRequestMessageBody>;

export function createGetAllDevicesRequestMessage(): GetAllDevicesRequestMessage {
  const msg: GetAllDevicesRequestMessage = {
    header: { type: MessageType.getAllDevicesRequest },
    body: {} as GetAllDevicesRequestMessageBody,
  };
  return msg;
}

export interface GetAllDevicesReplyMessageBody {
  devices: Device[];
}

export type GetAllDevicesReplyMessage = ReplyMessage<GetAllDevicesReplyMessageBody>;

