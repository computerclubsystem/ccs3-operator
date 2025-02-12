import { Device, ReplyMessage } from '@ccs3-operator/messages';

export interface CreateDeviceReplyMessageBody {
  device: Device;
}

export type CreateDeviceReplyMessage = ReplyMessage<CreateDeviceReplyMessageBody>;
