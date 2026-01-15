import { Message, ReplyMessage, MessageType } from '../index-declarations';
import { DeviceStatus } from '../index-entities';

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

