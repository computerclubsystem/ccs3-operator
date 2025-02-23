import { DeviceStatus } from '@ccs3-operator/messages';
import { Message, ReplyMessage } from './declarations/message';
import { MessageType } from './declarations/message-type';

export interface StartDeviceRequestMessageBody {
  deviceId: number;
  tariffId: number;
}

export type StartDeviceRequestMessage = Message<StartDeviceRequestMessageBody>;

export function createStartDeviceRequestMessage(): StartDeviceRequestMessage {
  const msg: StartDeviceRequestMessage = {
    header: { type: MessageType.startDeviceRequest },
    body: {} as StartDeviceRequestMessageBody,
  };
  return msg;
}

export interface StartDeviceReplyMessageBody {
  deviceStatus: DeviceStatus;
}

export type StartDeviceReplyMessage = ReplyMessage<StartDeviceReplyMessageBody> ;

