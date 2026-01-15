import { Message, ReplyMessage, MessageType } from '../index-declarations';
import { DeviceStatus } from '../index-entities';

export interface StopDeviceRequestMessageBody {
  deviceId: number;
  note?: string | null;
}

export type StopDeviceRequestMessage = Message<StopDeviceRequestMessageBody>;

export function createStopDeviceRequestMessage(): StopDeviceRequestMessage {
  const msg: StopDeviceRequestMessage = {
    header: { type: MessageType.stopDeviceRequest },
    body: {} as StopDeviceRequestMessageBody,
  };
  return msg;
}

export interface StopDeviceReplyMessageBody {
  deviceStatus: DeviceStatus;
}

export type StopDeviceReplyMessage = ReplyMessage<StopDeviceReplyMessageBody> ;

