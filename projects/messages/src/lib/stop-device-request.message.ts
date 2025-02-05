import { Message } from './declarations/message';
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
};
