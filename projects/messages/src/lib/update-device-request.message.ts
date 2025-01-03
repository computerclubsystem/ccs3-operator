import { Device } from '@ccs3-operator/messages';
import { Message } from './declarations/message';
import { MessageType } from './declarations/message-type';

export interface UpdateDeviceRequestMessageBody {
  device: Device;
}

export interface UpdateDeviceRequestMessage extends Message<UpdateDeviceRequestMessageBody> {
}

export function createUpdateDeviceRequestMessage(): UpdateDeviceRequestMessage {
  const msg: UpdateDeviceRequestMessage = {
    header: { type: MessageType.updateDeviceRequest },
    body: {} as UpdateDeviceRequestMessageBody,
  };
  return msg;
};
