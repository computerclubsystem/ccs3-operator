import { Device, Message, MessageType } from '@ccs3-operator/messages';

export interface CreateDeviceRequestMessageBody {
  device: Device;
}

export type CreateDeviceRequestMessage = Message<CreateDeviceRequestMessageBody>;

export function createCreateDeviceRequestMessage(): CreateDeviceRequestMessage {
  const msg: CreateDeviceRequestMessage = {
    header: { type: MessageType.createDeviceRequest },
    body: {} as CreateDeviceRequestMessageBody,
  };
  return msg;
}
