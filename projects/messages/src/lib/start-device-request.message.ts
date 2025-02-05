import { Message } from './declarations/message';
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
};
