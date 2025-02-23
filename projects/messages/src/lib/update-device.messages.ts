import { Device } from '@ccs3-operator/messages';
import { Message, ReplyMessage } from './declarations/message';
import { MessageType } from './declarations/message-type';

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
