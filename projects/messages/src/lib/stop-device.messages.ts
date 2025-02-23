import { DeviceStatus } from '@ccs3-operator/messages';
import { Message, ReplyMessage } from './declarations/message';
import { MessageType } from './declarations/message-type';

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

