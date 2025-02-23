import { Device } from '@ccs3-operator/messages';
import { Message, ReplyMessage } from './declarations/message';
import { MessageType } from './declarations/message-type';

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

