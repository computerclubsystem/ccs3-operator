import { Message, ReplyMessage, MessageType } from '../index-declarations';
import { Device } from '../index-entities';

export interface UpdateDeviceRequestMessageBody {
  device: Device;
}

export type UpdateDeviceRequestMessage = Message<UpdateDeviceRequestMessageBody>;

export function createUpdateDeviceRequestMessage(): UpdateDeviceRequestMessage {
  const msg: UpdateDeviceRequestMessage = {
    header: { type: MessageType.updateDeviceRequest },
    body: {} as UpdateDeviceRequestMessageBody,
  };
  return msg;
}

export interface UpdateDeviceReplyMessageBody {
  device?: Device;
}

export type UpdateDeviceReplyMessage = ReplyMessage<UpdateDeviceReplyMessageBody>;
